const gardenVoice = (() => {
  const storageKey = 'math-garden:voice-uri';
  const excludedNames = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)(?=$|[\s(（])/i;
  let preferred = '';
  let writeFailed = false;

  function selected() {
    if (writeFailed) return preferred;
    try {
      preferred = localStorage.getItem(storageKey) ?? '';
    } catch {
      // Keep the last selection when storage is unavailable.
    }
    return preferred;
  }

  function supported() {
    return typeof window.speechSynthesis?.speak === 'function' && typeof SpeechSynthesisUtterance === 'function';
  }

  function list() {
    return (window.speechSynthesis?.getVoices?.() ?? []).filter(voice =>
      /^(zh|cmn)(-|_|$)/i.test(voice.lang) && !/yue|HK/i.test(voice.lang)
      && !excludedNames.test(voice.name) && !/^com\.apple\.eloquence\./i.test(voice.voiceURI));
  }

  function set(uri) {
    preferred = uri;
    try {
      if (uri) localStorage.setItem(storageKey, uri);
      else localStorage.removeItem(storageKey);
      writeFailed = false;
    } catch {
      // Keep the selection for the current page when storage is unavailable.
      writeFailed = true;
    }
  }

  function stop() {
    window.speechSynthesis?.cancel?.();
  }

  function speak(text, { preview = false, onError, onEnd } = {}) {
    if (!text || (!preview && !gardenPreferences.soundEnabled()) || !supported()) return false;
    const voices = list();
    const selectedUri = selected();
    const voice = voices.find(item => item.voiceURI === selectedUri)
      ?? voices.find(item => /^(zh|cmn)[-_]CN$/i.test(item.lang)) ?? voices[0];
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang.replaceAll('_', '-') || 'zh-CN';
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = event => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') onError();
    };
    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  return { list, selected, set, speak, stop, supported };
})();
