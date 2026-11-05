const gardenOffline = (() => {
  let serviceWorkers;
  try {
    serviceWorkers = navigator.serviceWorker;
  } catch {
    // Some browsers deny service workers when storage is restricted.
  }
  const supported = Boolean(serviceWorkers && window.isSecureContext && /^https?:$/.test(location.protocol));
  const workerUrl = new URL('../sw.js', document.currentScript.src);
  const scope = new URL('./', workerUrl).href;
  const listeners = new Set();
  const observedWorkers = new WeakSet();
  let state = {
    status: supported ? 'loading' : 'unsupported',
    ready: false,
    checking: false,
    update: 'idle',
    version: null,
    availableVersion: null,
    message: supported ? '正在准备离线资源。' : '此环境暂不支持离线使用。请从 HTTPS 或本机预览打开。',
  };
  let registration;
  let registering;
  let revision = 0;

  function publish(changes) {
    state = { ...state, ...changes };
    for (const listener of listeners) listener(state);
    return state;
  }

  function askWorker(worker, type, timeout = 4000) {
    if (!worker) return Promise.resolve(null);
    return new Promise(resolve => {
      const channel = new MessageChannel();
      function finish(result) {
        clearTimeout(timer);
        channel.port1.close();
        resolve(result);
      }
      const timer = setTimeout(() => finish(null), timeout);
      channel.port1.onmessage = event => finish(event.data);
      try {
        worker.postMessage({ type }, [channel.port2]);
      } catch {
        finish(null);
      }
    });
  }

  async function refresh() {
    if (!registration) return state;
    const currentRevision = ++revision;
    const [active, waiting] = await Promise.all([
      askWorker(serviceWorkers.controller, 'GET_STATUS'),
      askWorker(registration.waiting, 'GET_STATUS'),
    ]);
    if (currentRevision !== revision) return state;
    const ready = active?.ready === true;
    const pending = registration.installing || registration.active?.state === 'activating';
    const status = ready ? 'ready' : pending ? 'loading' : 'error';
    const availableVersion = waiting?.ready ? waiting.version : null;
    const changes = { status, ready, version: active?.version ?? null, availableVersion };
    if (!state.checking && state.update !== 'applying') {
      if (availableVersion) {
        changes.update = 'available';
        changes.message = '新版已准备好，可以重新加载并回首页。';
      } else if (state.update === 'available' || state.update === 'idle') {
        changes.update = 'idle';
        changes.message = {
          ready: '已准备好，可离线使用。',
          loading: '正在准备离线资源。',
          error: '离线资源尚未准备好，请联网重试。',
        }[status];
      }
    }
    return publish(changes);
  }

  function observe(worker) {
    if (!worker || observedWorkers.has(worker)) return;
    observedWorkers.add(worker);
    worker.addEventListener('statechange', () => { void refresh(); });
  }

  async function register() {
    if (registration?.active || registration?.waiting || registration?.installing) return registration;
    if (!registering) {
      registering = serviceWorkers.getRegistration(scope).then(existing => {
        const worker = existing?.installing ?? existing?.waiting ?? existing?.active;
        if (existing?.scope === scope && worker?.scriptURL === workerUrl.href) return existing;
        return serviceWorkers.register(workerUrl, { scope, updateViaCache: 'none' });
      })
        .then(current => {
          registration = current;
          current.addEventListener('updatefound', () => { observe(current.installing); void refresh(); });
          observe(current.installing);
          return current;
        }).finally(() => { registering = null; });
    }
    return registering;
  }

  async function prepare(repair = true) {
    if (!supported || state.checking || state.update === 'applying') return state;
    publish({ update: 'idle' });
    try {
      const current = await register();
      const snapshot = await refresh();
      if (!repair || snapshot.ready || !serviceWorkers.controller || current.installing || current.waiting || !navigator.onLine) {
        return snapshot;
      }
      await current.update();
      if (!current.installing && !current.waiting) {
        publish({ status: 'loading', message: '正在重新准备离线资源。' });
        await askWorker(serviceWorkers.controller, 'PREPARE_OFFLINE', 30000);
      }
      return refresh();
    } catch {
      return publish({ status: 'error', message: '离线资源尚未准备好，请联网重试。' });
    }
  }

  function waitForInstall(worker) {
    return new Promise((resolve, reject) => {
      if (!worker) { resolve(); return; }
      function finish(error) {
        clearTimeout(timer);
        worker.removeEventListener('statechange', inspect);
        if (error) reject(error);
        else resolve();
      }
      function inspect() {
        if (worker.state === 'redundant') finish(new Error('Install failed'));
        else if (['installed', 'activating', 'activated'].includes(worker.state)) finish();
      }
      const timer = setTimeout(() => finish(new Error('Install timeout')), 30000);
      worker.addEventListener('statechange', inspect);
      inspect();
    });
  }

  async function checkForUpdate() {
    if (!supported || state.checking || state.update === 'applying') return state;
    if (!navigator.onLine && !registration?.waiting) {
      return publish({ update: 'offline', message: '当前未联网，联网后再检查更新。' });
    }
    publish({ checking: true, update: 'checking', message: '正在检查更新。' });
    try {
      const current = await register();
      if (!current.waiting) {
        let candidate = current.installing;
        const capture = () => { candidate = current.installing; };
        current.addEventListener('updatefound', capture);
        try {
          await current.update();
          await waitForInstall(current.installing ?? candidate);
        } finally {
          current.removeEventListener('updatefound', capture);
        }
      }
      const snapshot = await refresh();
      if (snapshot.availableVersion) {
        return publish({ checking: false, update: 'available', message: '新版已准备好，可以重新加载并回首页。' });
      }
      if (!snapshot.ready) throw new Error('App is not ready');
      return publish({ checking: false, update: 'current', message: '当前已是最新版。' });
    } catch {
      return publish({ checking: false, update: 'error', message: '暂时无法检查更新，请稍后重试。' });
    }
  }

  async function applyUpdate() {
    const waiting = registration?.waiting;
    if (state.checking || state.update === 'applying') return false;
    if (!waiting) return true;
    const previous = serviceWorkers.controller;
    publish({ update: 'applying', message: '正在启用新版。' });
    try {
      await new Promise((resolve, reject) => {
        function finish(error) {
          clearTimeout(timer);
          serviceWorkers.removeEventListener('controllerchange', changed);
          if (error) reject(error);
          else resolve();
        }
        function changed() {
          if (serviceWorkers.controller && serviceWorkers.controller !== previous) finish();
        }
        const timer = setTimeout(() => finish(new Error('Activation timeout')), 15000);
        serviceWorkers.addEventListener('controllerchange', changed);
        try {
          waiting.postMessage({ type: 'APPLY_UPDATE' });
          changed();
        } catch (error) {
          finish(error);
        }
      });
      return true;
    } catch {
      publish({ update: 'error', message: '暂时无法启用新版，请稍后重试。' });
      return false;
    }
  }

  if (supported) {
    serviceWorkers.addEventListener('controllerchange', () => { void refresh(); });
    window.addEventListener('pageshow', () => { void refresh(); });
    void prepare(false);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    prepare,
    checkForUpdate,
    applyUpdate,
  };
})();

window.gardenOffline = gardenOffline;
