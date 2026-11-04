const gardenPreferences = (() => {
  const soundKey = 'math-garden:sound-enabled';
  const demoKey = (activity) => `math-garden:demo-seen:${activity}`;
  const pageValues = new Map();

  function read(key, defaultValue) {
    if (pageValues.has(key)) return pageValues.get(key);
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'true' || stored === 'false') return stored === 'true';
    } catch {
      // Preferences still work for the current page when storage is unavailable.
    }
    return defaultValue;
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, String(value));
      pageValues.delete(key);
    } catch {
      pageValues.set(key, value);
    }
  }

  return {
    soundEnabled: () => read(soundKey, true),
    setSoundEnabled: (enabled) => write(soundKey, enabled),
    demoSeen: (activity) => read(demoKey(activity), false),
    markDemoSeen: (activity) => write(demoKey(activity), true),
  };
})();
