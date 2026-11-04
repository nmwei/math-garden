const home = document.querySelector('#home');
const games = document.querySelector('#games');
const gameListStatus = document.querySelector('#game-list-status');
const gardenTitle = document.title;
let parentAccess = false;
let lastPublicHash = '';

function renderToday() {
  const { placement, recommended, due } = getStudyPlan();
  const review = due[0];
  const lesson = review ?? recommended;
  document.querySelector('#today-lesson').textContent = lesson.title;
  document.querySelector('#today-detail').textContent = review ? '今天可以换一组题，再练练这课。' : lesson.goal;
  const start = document.querySelector('#today-start');
  start.href = `#course/${review ? 'review' : 'practice'}/${lesson.id}`;
  const firstLesson = !placement && lesson === courseLessons[0] && !readResult(lesson);
  start.textContent = review ? '复习一下' : firstLesson ? '试一节' : '练这一课';
}

function renderChallengeHub() {
  document.querySelector('#challenge-paths').innerHTML = challengePaths.map(path => {
    const nextIndex = nextChallengeIndex(path);
    const completed = completedChallengeCount(path);
    const next = path.skills[nextIndex];
    const total = path.skills.length;
    const needsPractice = next && readChallengeRecord(path, next);
    const action = needsPractice ? '换题再试' : completed ? '继续闯关' : '开始闯关';
    return `<article class="challenge-path" aria-labelledby="challenge-${path.id}-title">
      <div class="challenge-path-top">
        <h3 id="challenge-${path.id}-title">${path.title}</h3>
        <span class="challenge-path-mark" aria-hidden="true">${path.mark}</span>
      </div>
      <p>${path.description}</p>
      <div class="challenge-path-progress">
        <span>已完成 ${completed} / ${total} 站</span>
        <progress max="${total}" value="${completed}" aria-label="${path.title}闯关进度"></progress>
      </div>
      ${next ? `<p class="challenge-path-next">第 ${nextIndex + 1} 站 · ${next.title}</p>
        <div class="challenge-path-actions">
          <a class="garden-course-link primary" href="#course/challenge/${path.id}">${action}</a>
          ${needsPractice ? `<a class="garden-text-link" href="#course/lesson/${next.lesson}/${path.id}">去练这一课</a>` : ''}
        </div>` : '<p class="challenge-path-next">这条小路走完啦！</p>'}
    </article>`;
  }).join('');
}

function renderHome() {
  renderToday();
  renderChallengeHub();
}

function showGardenSection(active, focus) {
  for (const section of document.querySelectorAll('.garden > section')) {
    section.hidden = section !== active;
  }
  if (active === home) gardenShell.select('home');
  else if (active === parentSettings || active === challengeRecords) gardenShell.select('parent');
  else if (active !== courseRoot) gardenShell.select('games');
  focus?.focus();
}

function showGameList(focus, completed = false) {
  gameListStatus.hidden = !completed;
  showGardenSection(games, focus);
  gameListStatus.textContent = completed ? '三题都完成啦！' : '';
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

function requestParentRoute(hash) {
  gardenShell.requestParent(() => {
    parentAccess = true;
    location.hash = hash;
  });
}

function navigateWithinGarden() {
  gardenShell.closeParentGate();
  stopCountingFeedback();
  refreshSoundSetting();
  const hash = location.hash;
  if (hash === '#parent' || hash === '#parent/records') {
    if (!parentAccess && history.state?.parentAccess !== true) {
      history.replaceState(null, '', `${location.pathname}${location.search}${lastPublicHash}`);
      navigateWithinGarden();
      requestParentRoute(hash);
      return;
    }
    parentAccess = true;
    history.replaceState({ parentAccess: true }, '');
    window.scrollTo(0, 0);
    openParentView(hash === '#parent/records');
    return;
  }

  lastPublicHash = hash;
  document.title = gardenTitle;
  if (hash === '#games') {
    parentAccess = false;
    showGameList(document.querySelector('#games-title'));
  } else if (hash === '#course' || hash.startsWith('#course/')) {
    showGardenSection(courseRoot);
    openCourseRoute(hash.slice('#course'.length + 1));
    parentAccess = parentAccess && Boolean(challengeTarget);
  } else {
    parentAccess = false;
    renderHome();
    showGardenSection(home, document.querySelector('#home-title'));
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navigateWithinGarden);
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a');
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (anchor.dataset.gardenNav === 'parent' && parentSettings.hidden && challengeRecords.hidden) {
    event.preventDefault();
    requestParentRoute('#parent');
  } else if (anchor.getAttribute('href') === './') {
    event.preventDefault();
    if (location.href !== anchor.href) history.pushState(null, '', anchor.href);
    navigateWithinGarden();
  } else if (anchor.hash === '#games' && anchor.href === location.href) {
    event.preventDefault();
    navigateWithinGarden();
  }
});
window.addEventListener('pageshow', refreshSoundSetting);
window.addEventListener('storage', refreshSoundSetting);
window.addEventListener('pageshow', renderHome);
window.addEventListener('storage', renderHome);
const stopCountingFeedback = setupCounting();
window.addEventListener('pagehide', stopCountingFeedback);
setupChoiceGames();
if (location.hash) navigateWithinGarden();
else renderHome();
