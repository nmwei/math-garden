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
    const message = retry ? '换一道同类题，再试试。'
      : results.length ? '做对啦，接着试下一项。' : '慢慢想，按自己的节奏来。';
    wrapLesson(`
      <p class="course-kicker">${path.title} · 第 ${index + 1} 站</p>
      <h1 tabindex="-1">${skill.title}</h1>
      <p class="course-progress">本关第 ${results.length + 1} / ${roundSize} 项</p>
      <p class="course-note challenge-message">${message}</p>
      ${renderQuestionBody(question)}
      <button type="button" class="course-action" data-action="unsure">还不确定</button>`);
  }

  function answer(value) {
    if (!question) return;
    const skill = path.skills[index];
    if (value !== undefined && value !== question.answer && !retry) {
      retry = true;
      renderQuestion();
      return;
    }
    const outcome = value === question.answer ? (retry ? 'retry' : 'independent')
      : value === undefined ? 'unsure' : 'practice';
    saveChallengeRecord(path, skill, outcome);
    results.push({ skill, outcome });
    question = null;
    if (!challengePassed(outcome)) {
      renderResult(skill);
      return;
    }
    if (!targetSkill) index = nextChallengeIndex(path);
    if (results.length === roundSize || index === path.skills.length) renderResult();
    else openCheckpoint();
  }

  function renderResult(gap) {
    const completed = results.filter(item => challengePassed(item.outcome)).length;
    const passed = completedChallengeCount(path);
    const finished = passed === path.skills.length;
    const heading = gap ? '找到下一步啦' : targetSkill ? '这项测完啦' : finished ? '这条小路走完啦' : '这关走完啦';
    const recommendation = gap && challengeLesson(gap);
    const from = targetSkill ? `${path.id}/${targetSkill.id}` : path.id;
    wrapLesson(`<p class="course-kicker">${path.title}</p>
      <h1 tabindex="-1">${heading}</h1>
      ${roundSize ? `<p class="course-prompt">本关完成 ${completed} / ${roundSize} 个挑战</p>` : ''}
      <p class="course-note">这条小路已完成 ${passed} / ${path.skills.length} 站</p>
      ${results.length ? `<ul class="challenge-results">${results.map(({ skill, outcome }) =>
        `<li><span>${skill.title}</span><strong>${challengeOutcomeLabels[outcome]}</strong></li>`).join('')}</ul>` : ''}
      ${recommendation ? `<p>先练「${courseText(recommendation.title)}」，再回来用新题试一试。</p>` : ''}
      <div class="course-controls">
        ${recommendation ? `<a class="primary course-action" href="#course/lesson/${recommendation.id}/${from}">去练这一课</a>
          <button type="button" class="course-action" data-action="challenge-next">换题再试</button>`
        : targetSkill ? '<a class="primary course-action" href="#parent/records">完成，回到记录</a>'
        : finished ? '<a class="primary course-action" href="./">去选一条小路</a>'
        : '<button type="button" class="primary course-action" data-action="challenge-next">继续闯关</button>'}
      </div>`);
  }

  return { start, answer, next: () => start(path, targetSkill) };
})();
