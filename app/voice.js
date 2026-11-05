const gardenVoice = (() => {
  const storageKey = 'math-garden:voice-uri';
  const excludedNames = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)(?=$|[\s(（])/i;
  let preferred = '';
  let writeFailed = false;
  let playbackId = 0;

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
    globalThis.gardenFeedback?.stop();
    playbackId += 1;
    window.speechSynthesis?.cancel?.();
  }

  function speak(text, { onError, onEnd } = {}) {
    if (!text || !gardenPreferences.soundEnabled() || !supported()) return false;
    const voices = list();
    const mainland = (voice) => /^(zh|cmn)[-_]CN$/i.test(voice.lang);
    const local = voices.find(voice => voice.localService && mainland(voice))
      ?? voices.find(voice => voice.localService);
    const preferredUri = selected();
    const preferredVoice = voices.find(voice => voice.voiceURI === preferredUri);
    let voice = preferredVoice ?? local ?? voices.find(mainland) ?? voices[0];
    stop();
    const id = playbackId;
    if (navigator.onLine === false && voice?.localService === false) {
      if (!local) return false;
      voice = local;
    }

    function play(voice, backup) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang.replaceAll('_', '-') || 'zh-CN';
      if (voice) utterance.voice = voice;
      utterance.rate = 0.85;
      utterance.onend = () => { if (id === playbackId) onEnd?.(voice); };
      utterance.onerror = ({ error }) => {
        if (id !== playbackId || error === 'canceled' || error === 'interrupted') return;
        if (!backup || !play(backup)) onError?.();
      };
      try {
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        return backup ? play(backup) : false;
      }
    }

    return play(voice, voice?.localService === false ? local : undefined);
  }

  return { list, selected, set, speak, stop, supported };
})();
