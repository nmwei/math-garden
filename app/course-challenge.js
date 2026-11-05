function renderChallengeRoute(path, selectedSkill) {
  gardenVoice.stop();
  const nextIndex = nextChallengeIndex(path);
  const selected = selectedSkill ?? path.skills[nextIndex];
  const completed = completedChallengeCount(path);
  courseRoot.innerHTML = `
    <div class="course-top"><a class="course-action" href="./">回花园闯关</a></div>
    <header class="garden-page-header">
      <div class="garden-page-heading"><p class="garden-page-kicker">花园路线</p><h1 tabindex="-1">${path.title}</h1></div>
      <p class="challenge-route-progress">已完成 ${completed} / ${path.skills.length} 站</p>
    </header>
    <p class="challenge-route-intro">${path.description} 点开一站，可以看看对应的课程。</p>
    <ol class="challenge-stations" role="list">${path.skills.map((skill, index) => {
      const record = readChallengeRecord(path, skill);
      const current = index === nextIndex;
      const available = canChallengeStation(path, skill, nextIndex);
      const lesson = challengeLesson(skill);
      const state = record ? challengeOutcomeLabels[record.outcome] : current ? '下一站' : '待挑战';
      const action = current ? (record ? '换题再试' : '挑战这一站') : '再玩一次';
      return `<li>
        <details class="challenge-station${current ? ' is-current' : ''}"${skill === selected ? ' open' : ''}>
          <summary${current ? ' aria-current="step"' : ''}>
            <span class="challenge-station-number">第 ${index + 1} 站</span>
            <strong>${skill.title}</strong>
            <span class="challenge-station-state">${state}</span>
          </summary>
          <div class="challenge-station-body">
            <p>对应课程 · ${courseText(lesson.title)}</p>
            <div class="challenge-path-actions">
              ${available ? `<a class="course-action primary" href="${challengeStationHref(path, skill)}">${action}</a>` : ''}
              <a class="garden-text-link" href="${challengeLessonHref(path, skill)}">看对应课程 <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </details></li>`;
    }).join('')}</ol>`;
  const selectedRow = selectedSkill && courseRoot.querySelector('.challenge-station[open]');
  if (selectedRow) {
    selectedRow.querySelector('summary').focus({ preventScroll: true });
    selectedRow.scrollIntoView({ block: 'nearest' });
  } else courseRoot.querySelector('h1').focus();
}

const courseChallenge = (() => {
  let path;
  let targetSkill;
  let index;
  let question;
  let pair;
  let retry;
  let roundSize;
  let results;

  function start(selectedPath, selectedSkill = null) {
    path = selectedPath;
    targetSkill = selectedSkill;
    index = targetSkill ? path.skills.indexOf(targetSkill) : nextChallengeIndex(path);
    results = [];
    roundSize = targetSkill ? 1 : Math.min(4, path.skills.length - completedChallengeCount(path));
    if (roundSize) openCheckpoint();
    else renderResult();
  }

  function openCheckpoint() {
    const skill = path.skills[index];
    const attempt = readChallengeRecord(path, skill)?.attempts ?? 0;
    pair = attempt % 2 * 2;
    retry = false;
    renderQuestion();
  }

  function renderQuestion() {
    const skill = path.skills[index];
    question = skill.questions[pair + Number(retry)];
    const message = retry ? renderCourseFeedback('换一道同类题，再试试。', 'retry')
      : results.length ? renderCourseFeedback('做对啦，接着试下一项。', 'correct')
      : '慢慢想，按自己的节奏来。';
    wrapLesson(`
      <p class="course-kicker">${path.title} · 第 ${index + 1} 站</p>
      <h1 tabindex="-1" aria-describedby="challenge-message">${skill.title}</h1>
      <p class="course-progress">本关第 ${results.length + 1} / ${roundSize} 项</p>
      <p class="course-note challenge-message" id="challenge-message">${message}</p>
      ${renderQuestionBody(question)}
      <button type="button" class="course-action" data-action="unsure">还不确定</button>`, challengeRouteHref(path, skill));
  }

  function answer(value) {
    if (!question) return;
    const current = question, skill = path.skills[index];
    question = null; // Lock this answer while feedback is playing.
    const anchor = courseRoot.querySelector('.course-controls');
    if (value !== undefined && value !== current.answer && !retry) {
      retry = true;
      courseRoot.querySelector('#challenge-message').textContent = '换一道同类题，再试试。';
      advanceAfterGardenFeedback(false, anchor, renderQuestion);
      return;
    }
    const outcome = value === current.answer ? (retry ? 'retry' : 'independent')
      : value === undefined ? 'unsure' : 'practice';
    saveChallengeRecord(path, skill, outcome);
    results.push({skill, outcome});
    if (value === undefined) { renderResult(skill); return; }
    const correct = challengePassed(outcome);
    courseRoot.querySelector('#challenge-message').textContent = correct ? '答对啦！' : '找到下一步可以练的内容啦。';
    advanceAfterGardenFeedback(correct, anchor, () => {
      if (!correct) { renderResult(skill); return; }
      if (!targetSkill) index = nextChallengeIndex(path);
      if (results.length === roundSize || index === path.skills.length) renderResult();
      else openCheckpoint();
    });
  }

  function renderResult(gap) {
    const completed = results.filter(item => challengePassed(item.outcome)).length;
    const passed = completedChallengeCount(path);
    const finished = passed === path.skills.length;
    const heading = gap ? '找到下一步啦' : targetSkill ? '这项测完啦' : finished ? '这条小路走完啦' : '这关走完啦';
    const recommendation = gap && challengeLesson(gap);
    const routeBack = challengeRouteHref(path, gap ?? targetSkill);
    wrapLesson(`<p class="course-kicker">${path.title}</p>
      <h1 tabindex="-1">${heading}</h1>
      ${!gap && completed ? `<p class="challenge-message">${renderCourseFeedback('答对啦！', 'correct')}</p>` : ''}
      ${roundSize ? `<p class="course-prompt">本关完成 ${completed} / ${roundSize} 个挑战</p>` : ''}
      <p class="course-note">这条小路已完成 ${passed} / ${path.skills.length} 站</p>
      ${results.length ? `<ul class="challenge-results">${results.map(({ skill, outcome }) =>
        `<li><span>${skill.title}</span><strong>${challengeOutcomeLabels[outcome]}</strong></li>`).join('')}</ul>` : ''}
      ${recommendation ? `<p>先练「${courseText(recommendation.title)}」，再回来用新题试一试。</p>` : ''}
      <div class="course-controls">
        ${recommendation ? `<a class="primary course-action" href="${challengeLessonHref(path, gap)}">去练这一课</a>
          <button type="button" class="course-action" data-action="challenge-retry">换题再试</button>`
        : targetSkill || finished ? `<a class="primary course-action" href="${routeBack}">完成，回路线</a>`
        : '<button type="button" class="primary course-action" data-action="challenge-next">继续闯关</button>'}
      </div>`, routeBack);
  }

  return { start, answer, next: () => start(path), retryCurrent: () => start(path, path.skills[index]) };
})();
