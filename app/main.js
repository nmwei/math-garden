const home = document.querySelector('#home');

function showGardenSection(active, focus) {
  for (const section of document.querySelectorAll('.garden > section')) {
    section.hidden = section !== active;
  }
  gardenShell.select(active === home && location.hash !== '#games' ? 'home' : 'games');
  focus.focus();
}

function stopGardenSpeech() {
  gardenVoice.stop();
}

function sayInGarden(text) {
  gardenVoice.speak(text);
}

function refreshSoundSetting() {
  const muted = !gardenPreferences.soundEnabled();
  document.documentElement.classList.toggle('practice-muted', muted);
  if (muted) stopGardenSpeech();
}

refreshSoundSetting();

function navigateWithinGarden() {
  const games = location.hash === '#games';
  stopGardenSpeech();
  showGardenSection(home, document.querySelector(games ? '#games-title' : '#home-title'));
  if (games) document.querySelector('#games').scrollIntoView();
  else window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navigateWithinGarden);
document.querySelector('.garden-bar').addEventListener('click', (event) => {
  const anchor = event.target.closest('a');
  if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = anchor.getAttribute('href');
  if ((hash === '#home' || hash === '#games') && hash === location.hash) {
    event.preventDefault();
    navigateWithinGarden();
  }
});
window.addEventListener('pageshow', refreshSoundSetting);
window.addEventListener('storage', refreshSoundSetting);
window.addEventListener('pagehide', stopGardenSpeech);
setupCounting();
setupChoiceGames();
