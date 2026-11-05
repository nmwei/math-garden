const parentSound = document.querySelector('#parent-sound');
const voiceSelect = document.querySelector('#parent-voice-select');
const previewVoice = document.querySelector('#preview-voice');
const voiceSupport = document.querySelector('#voice-support');
const voiceStatus = document.querySelector('#voice-status');
const voiceNote = voiceSupport.textContent;

function showParentSound(enabled) {
  parentSound.setAttribute('aria-pressed', String(enabled));
  parentSound.querySelector('span').textContent = enabled ? '开' : '关';
  previewVoice.hidden = !enabled;
  if (!enabled) gardenVoice.stop();
}

function renderParentVoices() {
  const supported = gardenVoice.supported();
  const voices = gardenVoice.list();
  const preferred = gardenVoice.selected();
  voiceSelect.replaceChildren(new Option('自动选择普通话声音', ''));
  for (const voice of voices) {
    const source = voice.localService ? '本地' : '需联网';
    voiceSelect.add(new Option(`${voice.name} · ${voice.lang} · ${source}`, voice.voiceURI));
  }
  const missing = preferred && !voices.some(voice => voice.voiceURI === preferred);
  if (missing) voiceSelect.add(new Option('上次选择的声音暂不可用', preferred));
  voiceSelect.value = preferred;
  voiceSelect.disabled = !supported || (!voices.length && !preferred);
  previewVoice.disabled = !supported;
  if (!supported) {
    voiceSupport.textContent = '此浏览器暂不支持设备朗读。课程仍可看图和文字练习。';
  } else if (missing) {
    voiceSupport.textContent = '上次选择的声音暂不可用，将自动尝试设备的普通话声音。';
  } else {
    voiceSupport.textContent = voices.length ? voiceNote : '设备暂未列出可选的普通话声音。系统会尝试自动选择。';
  }
}

function refreshParentControls() {
  showParentSound(gardenPreferences.soundEnabled());
  renderParentVoices();
}

refreshParentControls();
window.speechSynthesis?.addEventListener?.('voiceschanged', renderParentVoices);
window.addEventListener('pageshow', refreshParentControls);
window.addEventListener('storage', refreshParentControls);
parentSound.addEventListener('click', () => {
  const enabled = !gardenPreferences.soundEnabled();
  gardenPreferences.setSoundEnabled(enabled);
  showParentSound(enabled);
  voiceStatus.textContent = enabled ? '练习声音已开启。' : '练习声音已关闭。';
});

voiceSelect.addEventListener('change', () => {
  gardenVoice.stop();
  gardenVoice.set(voiceSelect.value);
  renderParentVoices();
  voiceStatus.textContent = '声音偏好已保存。';
});
previewVoice.addEventListener('click', () => {
  const onError = () => { voiceStatus.textContent = '设备暂时未能朗读。可以检查系统声音后再试。'; };
  voiceStatus.textContent = '正在试听…';
  const started = gardenVoice.speak('你好，欢迎来到一二三小花园。一、二、三，我们开始吧！', {
    onError,
    onEnd: voice => { voiceStatus.textContent = voice ? `试听完成 · ${voice.name}` : '试听完成。'; },
  });
  if (!started) onError();
});

const prepareOffline = document.querySelector('#prepare-offline');
const checkUpdate = document.querySelector('#check-update');
const reloadPage = document.querySelector('#reload-page');
const offlineStatus = document.querySelector('[data-offline-status]');
const updateStatus = document.querySelector('[data-update-status]');

const offlineLabels = {
  loading: '正在准备离线资源…',
  unsupported: '此浏览器暂不支持离线准备，可以联网练习。',
  error: '离线资源暂未准备好，请联网后再试。',
};
const updateLabels = {
  checking: '正在检查更新…',
  current: '当前已是最新版本。',
  available: '新版本已准备好。重新加载后就会启用。',
  applying: '正在启用新版本…',
  offline: '现在没有网络，联网后可再检查。',
  error: '暂时无法检查或启用更新，请稍后再试。',
};

gardenOffline.subscribe(state => {
  offlineStatus.textContent = state.ready ? '已准备好，可离线练习。' : offlineLabels[state.status] ?? offlineLabels.loading;
  prepareOffline.hidden = state.status !== 'error';
  checkUpdate.disabled = state.status === 'unsupported' || state.status === 'loading'
    || state.checking || state.update === 'applying';
  const updateReady = Boolean(state.availableVersion) || state.update === 'applying';
  checkUpdate.classList.toggle('primary', !updateReady);
  reloadPage.classList.toggle('primary', updateReady);
  reloadPage.disabled = state.checking || state.update === 'applying';
  updateStatus.textContent = updateLabels[state.update] ?? (state.status === 'unsupported' ? '此浏览器暂不支持应用更新。' : '');
});
prepareOffline.addEventListener('click', () => gardenOffline.prepare());
checkUpdate.addEventListener('click', () => gardenOffline.checkForUpdate());
reloadPage.addEventListener('click', async () => {
  if (!await gardenOffline.applyUpdate()) return;
  history.replaceState(null, '', location.pathname + location.search);
  location.reload();
});

const parentSettings = document.querySelector('#parent-settings');
const resetProgressButton = document.querySelector('#reset-progress');
const resetProgressDialog = document.querySelector('#reset-progress-dialog');
const resetProgressToast = document.querySelector('#reset-progress-toast');
const resetProgressError = document.querySelector('#reset-progress-error');
let resetProgressToastTimer;

function clearResetProgressToast() {
  window.clearTimeout(resetProgressToastTimer);
  resetProgressToast.textContent = '';
}

resetProgressButton.addEventListener('click', () => {
  clearResetProgressToast();
  resetProgressError.textContent = '';
  resetProgressDialog.showModal();
});
document.querySelector('#confirm-reset-progress').addEventListener('click', () => {
  if (!resetLearningProgress()) {
    resetProgressError.textContent = '暂时无法清除所有学习记录，请再试一次。';
    return;
  }
  resetProgressDialog.close();
  resetProgressToast.textContent = '学习进度已重置';
  resetProgressToastTimer = window.setTimeout(clearResetProgressToast, 3000);
});
resetProgressDialog.addEventListener('close', () => {
  if (location.hash === '#parent') resetProgressButton.focus();
});
window.addEventListener('hashchange', () => {
  if (resetProgressDialog.open) resetProgressDialog.close();
  clearResetProgressToast();
});

function openParentView() {
  showGardenSection(parentSettings, document.querySelector('#parent-title'));
  refreshParentControls();
  document.title = '家长小角 · 123 小花园';
}
