const gardenShell = (() => {
  const bar = document.querySelector('.garden-bar');
  const paths = {
    home: '<path d="M5 21V4m0 1c5-5 9 4 15 0v10c-6 4-10-5-15 0"/>',
    course: '<path d="M12 5v15m0-15C9 3 6 3 3 4v14c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1z"/>',
    games: '<circle cx="7" cy="7" r="3.5"/><path d="m12 19 4.5-8 4.5 8zM3 13h7v7H3z"/>',
    parent: '<path d="m12 3 8 4v5c0 4-3 7-8 9-5-2-8-5-8-9V7z"/><path d="m9 12 2 2 4-4"/>',
  };
  const icon = (name) => `<svg class="garden-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const items = [
    ['home', './', '花园闯关'],
    ['course', '#course', '学习地图'],
    ['games', '#games', '数学游戏'],
  ];

  bar.innerHTML = `<a class="brand" href="${items[0][1]}">
      <img src="./assets/icon.svg" alt="" width="42" height="42">
      <span><strong>123 小花园</strong><small>MATH GARDEN</small></span>
    </a>
    <nav class="garden-nav" aria-label="主要导航">${items.map(([id, href, label]) =>
      `<a href="${href}" data-garden-nav="${id}">${icon(id)}<span>${label}</span></a>`).join('')}</nav>
    <div class="garden-rail-end">
      <div class="garden-sprout" aria-hidden="true"><span></span><i></i><b></b></div>
      <p class="garden-motto">小小的问题，好多种办法。</p>
      <a class="garden-parent-link" href="#parent" data-garden-nav="parent">${icon('parent')}<span>家长小角</span></a>
    </div>`;

  function select(id) {
    for (const link of bar.querySelectorAll('[data-garden-nav]')) {
      if (link.dataset.gardenNav === id) link.setAttribute('aria-current', id === 'games' ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    }
  }

  select('home');

  let requestParent = (onEnter) => onEnter();
  let closeParentGate = () => {};
  if (typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
    const link = bar.querySelector('.garden-parent-link');
    const dialog = document.createElement('dialog');
    dialog.className = 'garden-parent-dialog';
    dialog.setAttribute('aria-labelledby', 'garden-parent-dialog-title');
    dialog.innerHTML = `<h2 id="garden-parent-dialog-title">家长小角</h2>
      <p>声音、离线使用和应用更新，请交给家长来操作。</p>
      <form method="dialog"><button class="secondary" value="cancel" autofocus>取消</button>
        <button type="button" class="primary parent-hold">按住 1 秒进入</button></form>`;
    document.body.append(dialog);
    const hold = dialog.querySelector('.parent-hold');
    let timer = null;
    let pointerId = null;
    let enterParent;

    function cancelHold() {
      clearTimeout(timer);
      timer = null;
      pointerId = null;
      hold.classList.remove('holding');
    }

    function startHold() {
      if (timer !== null || !dialog.open || document.hidden) return;
      hold.classList.add('holding');
      timer = setTimeout(() => {
        cancelHold();
        if (!dialog.open || document.hidden) return;
        dialog.close('navigate');
        enterParent();
      }, 1000);
    }

    hold.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !event.isPrimary || timer !== null) return;
      event.preventDefault();
      pointerId = event.pointerId;
      hold.setPointerCapture(event.pointerId);
      startHold();
    });
    hold.addEventListener('pointermove', (event) => {
      if (pointerId !== event.pointerId) return;
      const box = hold.getBoundingClientRect();
      const { clientX: x, clientY: y } = event;
      if (x < box.left || x > box.right || y < box.top || y > box.bottom) cancelHold();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) {
      hold.addEventListener(event, cancelHold);
    }
    hold.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      if (!event.repeat) startHold();
    });
    hold.addEventListener('keyup', (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      cancelHold();
    });
    hold.addEventListener('contextmenu', (event) => event.preventDefault());
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelHold(); });
    window.addEventListener('blur', cancelHold);

    requestParent = (onEnter) => {
      enterParent = onEnter;
      if (dialog.open) return;
      dialog.returnValue = '';
      dialog.showModal();
    };
    closeParentGate = () => { if (dialog.open) dialog.close('navigate'); };
    dialog.addEventListener('cancel', cancelHold);
    dialog.addEventListener('close', () => {
      cancelHold();
      if (dialog.returnValue !== 'navigate') link.focus();
    });
    window.addEventListener('pagehide', () => {
      cancelHold();
      closeParentGate();
    });
  }

  return { select, requestParent, closeParentGate };
})();
