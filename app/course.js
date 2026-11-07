const courseRoot = document.querySelector('#course-root');
let lesson;
let step;
let independent;
let usedHelp;
let answered;
let options;
let mode;
let practiceItems;
let firstGap;
let placementRetry;
let retriedPlacement;
let returnToChallenge;
let returnToStation;

function saveResult() {
  writeCourseMemory(`math-garden:course:${lesson.id}`, {
    independent, total: practiceItems.length, attempts: (readResult(lesson)?.attempts ?? 0) + 1,
  });
}

function stageOf(item) {
  return courseStages.find(stage => stage.lessons.includes(item));
}

function lessonLink(item, text, primary = false) {
  return `<a class="course-action${primary ? ' primary' : ''}" href="#course/lesson/${item.id}">${courseText(text)}</a>`;
}

function reviewLink(item, text) {
  if (!spacedCoursePractice(item, 1)?.length) return lessonLink(item, text);
  return `<a class="course-action" href="#course/review/${item.id}">${courseText(text)}</a>`;
}

function lessonState(item) {
  const result = readResult(item);
  if (!result) return '可以开始';
  return result.independent === result.total ? '已练 · 独立答对' : '已练 · 可复习';
}

function courseCard(item, isRecommended) {
  return `<a class="course-lesson" href="#course/lesson/${item.id}" aria-label="${courseText(item.title)}"${isRecommended ? ' aria-describedby="course-recommendation"' : ''}>
    <span class="course-card-meta">
      <span class="course-card-state">${lessonState(item)}</span>
      ${isRecommended ? '<span class="course-card-badge" id="course-recommendation">推荐</span>' : ''}
    </span>
    <strong>${courseText(item.title)}</strong>
    <small>${courseText(item.goal)}</small>
  </a>`;
}

function renderMap(stageId) {
  const { selected, recommended, revisit, due } = getStudyPlan(stageId);
  const active = selected ?? stageOf(recommended);
  const review = revisit && revisit !== recommended && !due.includes(revisit)
    ? reviewLink(revisit, `复习 · ${revisit.title}`) : '';
  courseRoot.innerHTML = `
    <header class="garden-page-header">
      <div class="garden-page-heading"><p class="garden-page-kicker">数学小课堂</p><h1 tabindex="-1">数学学习地图</h1></div>
      <p class="garden-page-note"><span aria-hidden="true">✳</span> 按自己的节奏学</p>
    </header>
    ${due.length || review ? `<section class="course-panel course-due" aria-labelledby="due-title">
      <h2 id="due-title">${due.length ? '今日复习' : '可以再练'}</h2><p>换一组题，再试试上次用过的办法。</p>
      <div class="course-controls">${due.map(item => reviewLink(item, `复习 · ${item.title}`)).join('')}${review}</div>
    </section>` : ''}
    <nav class="course-stages" aria-label="学习阶段">
      ${courseStages.map(stage => `<a class="course-action" href="#course/${stage.id}"${stage === active ? ' aria-current="page"' : ''}>${stage.label}</a>`).join('')}
    </nav>
    <p class="course-note course-stage-guide">从你会的地方开始，想练哪一课都可以。</p>
    ${active.id === 'grade-3' ? `<section class="course-panel workshop-review" aria-labelledby="grade-workshop">
      <div><h2 id="grade-workshop">${workshopTitle}</h2><p>画图解生活题、摆纸带认识分数，也可以混合复习。</p></div>
      <a class="primary course-action" href="${workshopRoute}">进数学工坊</a>
    </section>` : ''}
    <section class="course-panel" aria-labelledby="stage-title">
      <div class="course-top">
        <div>
          <h2 id="stage-title">${courseText(active.title)}</h2>
          <p>${courseText(active.description)}</p>
          <small class="course-note">家长参考 · ${courseText(active.reference)}</small>
        </div>
        <span class="course-note">已练 ${active.lessons.filter(item => readResult(item)).length} / ${active.lessons.length} 课</span>
      </div>
      <div class="course-lessons">${active.lessons.map(item => courseCard(item, item === recommended)).join('')}</div>
    </section>`;
}

function wrapLesson(content, routeBack = returnToChallenge && challengeRouteHref(returnToChallenge, returnToStation), panelClass = '') {
  gardenVoice.stop();
  const stage = lesson ? stageOf(lesson) : null;
  const inChallenge = mode === 'challenge';
  const back = routeBack ? `<a class="course-action" href="${routeBack}">回路线</a>`
    : `<a class="course-action" href="${stage ? `#course/${stage.id}` : '#course'}">回学习地图</a>`;
  courseRoot.innerHTML = `<div class="course-top">
    ${back}
    <span class="course-kicker">${stage?.label ?? (inChallenge ? '花园闯关' : '找起点')}</span>
  </div><section class="course-panel course-done course-activity ${panelClass}">${content}</section>`;
  courseRoot.querySelector('h1').focus();
}

function renderExample() {
  const { title, goal } = lesson;
  const teaching = lesson.teaching ?? courseTeaching[lesson.id];
  const activities = workshopLinks(lesson.id);
  const start = '<button type="button" class="primary course-action" data-action="start">开始练习</button>';
  wrapLesson(`<p class="course-kicker">先看一个例子</p>
    <h1 tabindex="-1">${courseText(title)}</h1><p>${courseText(goal)}</p>
    ${renderWorkedExample(lesson.example)}
    <details class="course-teaching course-extension">
      <summary>换个例子想一想</summary>
      ${teaching.model ? `<div class="course-teaching-model">${renderCourseModel(teaching.model)}</div>` : ''}
      ${renderCourseReadout(teaching.notice, '听问题')}
      <details class="course-teaching-answer">
        <summary>看看怎么想</summary>
        ${renderCourseReadout(teaching.connect, '听讲解')}
      </details>
    </details>
    ${activities ? `<div class="course-controls">${start}${activities}</div>` : start}`, undefined, 'course-example');
}

function renderWorkedExample(example) {
  return `<div class="worked-example"><div class="course-model">${renderCourseModel(example.model)}</div>
    ${renderCourseReadout(example.text, '听例子')}</div>`;
}

function renderInput(item, displayedChoices) {
  if (item.build) return renderCourseBuild(item.build);
  if (item.line) return renderCourseLineInput(item.line);
  if (displayedChoices.length) {
    const disabled = (item.bundles?.ones ?? 0) >= 10 ? ' disabled' : '';
    return `<div class="choices course-choices" role="group" aria-label="答案选项">${displayedChoices.map((value, index) =>
      `<button type="button" data-option="${index}"${String(value).length > 12 ? ' class="long-choice"' : ''}${disabled}>${courseText(value)}</button>`).join('')}</div>`;
  }
  return `<form class="course-number-form">
    <label>填入答案 <input class="course-input" inputmode="numeric" pattern="[0-9]+" maxlength="12" required></label>
    <button type="submit" class="primary course-action">确认答案</button>
  </form>`;
}

function courseSpeechText(text) {
  const words = {
    '+': '加', '＋': '加', '−': '减', '-': '减', '－': '减', '×': '乘', '÷': '除以',
    '=': '等于', '＝': '等于', '>': '大于', '＞': '大于', '<': '小于', '＜': '小于',
    '□': '空格', '～': '到', '↑': '朝上', '↓': '朝下', '←': '朝左', '→': '朝右',
    '↖': '朝左上', '↗': '朝右上', '↘': '朝右下', '↙': '朝左下', '○': '圆形', '│': '，镜线，',
  };
  return text.replace(/(\d+)\s*\/\s*(\d+)/g, '$2分之$1')
    .replace(/(\d)\s*→\s*(?=\d)/g, '$1，')
    .replace(/(\d{1,2}):(\d{2})/g, (_, hour, minute) => `${hour}点${minute === '00' ? '整' : `${Number(minute)}分`}`)
    .replace(/[+＋−－×÷=＝>＞<＜□～↑↓←→↖↗↘↙○│-]/g, symbol => words[symbol]);
}

function renderCourseReadout(text, label, spoken = text) {
  return `<div class="course-readout">
    <div class="course-readout-line"><p class="course-prompt">${courseText(text)}</p>
      <button type="button" class="course-action practice-hear" data-action="hear" data-speech="${courseText(courseSpeechText(spoken))}">${label}</button>
    </div>
    <span class="course-speech-status course-note" aria-live="polite"></span>
  </div>`;
}

function renderQuestionBody(item) {
  options = shuffleOptions(item.choices ?? []);
  return renderCourseQuestion(item, renderInput(item, options));
}

function renderCourseQuestion(item, input) {
  const modelText = item.model?.kind === 'text' && !item.model.text.includes('├') ? item.model.text : '';
  const spoken = modelText ? `${modelText}。${item.prompt}` : item.prompt;
  return `${renderCourseReadout(item.prompt, '听题目', spoken)}
    <div class="course-model">${item.bundles ? renderBundleTray(item.bundles.ones) : renderCourseModel(item.model, true)}</div>
    <div class="course-controls">${input}</div>`;
}

function renderCourseFeedback(message, kind) {
  return `<span class="course-feedback course-feedback-${kind}">${courseText(message)}</span>`;
}

function renderPractice() {
  const placing = mode === 'placement';
  const retry = placing && placementRetry;
  const item = retry ? practiceItems[step].retry : practiceItems[step];
  usedHelp = answered = false;
  wrapLesson(`<p class="course-progress">第 ${step + 1} / ${practiceItems.length} 题${retry ? ' · 换一题再试' : ''}</p>
    <h1 tabindex="-1">${placing ? '找找学习起点' : courseText(lesson.title)}</h1>
    ${renderQuestionBody(item)}
    ${placing ? '<button type="button" class="course-action" data-action="unsure">还不确定</button>' : `
    <p id="course-answer-status" class="course-status" role="status"></p>
    <p class="course-note" id="course-hint" hidden>${courseText(item.hint)}</p>
    <div class="course-controls">
      <button type="button" class="course-action" data-action="hint" aria-controls="course-hint" aria-expanded="false">看提示</button>
      <button type="button" class="course-action" data-action="example-help" aria-controls="course-method" aria-expanded="false" hidden>看一遍怎么做</button>
      <button type="button" class="primary course-action" data-action="next" hidden>${step + 1 === practiceItems.length ? '看练习结果' : '下一题'}</button>
    </div>
    <section class="course-teaching" id="course-method" hidden aria-labelledby="course-method-title">
      <h2 id="course-method-title">回看例题的方法</h2>
      ${renderWorkedExample(lesson.example)}
      <details class="course-teaching-answer">
        <summary>看看这道题的解法</summary>
        ${renderCourseReadout(item.explanation, '听解法')}
      </details>
    </section>`}`);
}

function checkAnswer(value, attempted) {
  if (mode === 'challenge') {
    courseChallenge.answer(value);
    return;
  }
  if (answered) return;
  const item = practiceItems[step];
  if (mode === 'placement') {
    const proceed = () => {
      if (!placementRetry && value !== undefined && value !== item.answer) {
        placementRetry = retriedPlacement = true;
        renderPractice(); return;
      }
      const answer = placementRetry ? item.retry.answer : item.answer;
      if (value !== answer) firstGap ??= { item, unsure: value === undefined };
      placementRetry = false; step += 1;
      if (step === practiceItems.length) renderPlacementResult();
      else renderPractice();
    };
    if (value === undefined) { proceed(); return; }
    answered = true;
    const correct = value === (placementRetry ? item.retry.answer : item.answer);
    const status = document.createElement('p'); status.setAttribute('role','status');
    status.textContent = correct ? '答对啦！' : '换一道同类题，再试试。';
    courseRoot.querySelector('.course-panel').append(status);
    advanceAfterGardenFeedback(correct, attempted || status, proceed);
    return;
  }
  const status = courseRoot.querySelector('.course-status');
  const buttons = [...courseRoot.querySelectorAll('[data-option], [data-line-value]')];
  showRetryChoice(buttons, value !== item.answer ? attempted : undefined);
  if (value !== item.answer) {
    usedHelp = true;
    status.innerHTML = renderCourseFeedback('再试一次，也可以看一个提示。', 'retry');
    playGardenFeedback(false);
    return;
  }

  answered = true;
  if (!usedHelp) independent += 1;
  const correctChoice = attempted?.hasAttribute('data-option');
  if (correctChoice) {
    attempted.classList.add('is-correct');
    attempted.setAttribute('aria-describedby', 'course-answer-status');
    attempted.insertAdjacentHTML('beforeend', `<span class="course-choice-check" aria-hidden="true">✓</span>`);
  }
  status.innerHTML = `${renderCourseFeedback('答对啦！', 'correct')}
    <span class="course-explanation">${courseText(item.explanation)}</span>`;
  for (const control of courseRoot.querySelectorAll('[data-option], [data-line-value], [data-plot], [data-dot], [data-action="check-build"], .course-input, [type="submit"]')) {
    control.disabled = true;
  }
  courseRoot.querySelector('[data-action="hint"]').hidden = true;
  courseRoot.querySelector('[data-action="example-help"]').hidden = true;
  courseRoot.querySelector('#course-method').hidden = true;
  const next = courseRoot.querySelector('[data-action="next"]');
  next.hidden = false;
  next.focus();
  playGardenFeedback(true, attempted || status);
}

function renderResult() {
  if (mode === 'study') saveResult();
  scheduleCourseReview(lesson, independent === practiceItems.length);
  const nextLesson = courseLessons[courseLessons.indexOf(lesson) + 1];
  const retryStation = returnToChallenge && canChallengeStation(returnToChallenge, returnToStation);
  wrapLesson(`<p class="course-kicker">又长大了一点</p><h1 tabindex="-1">${mode === 'review' ? '这次复习完成啦' : '这一课练完啦'}</h1>
    <p class="course-prompt">本次首次独立答对 ${independent} / ${practiceItems.length} 题</p>
    <p>${independent === practiceItems.length ? '你用自己的办法把这组做完了。' : '用提示找到办法也是在学习。想试试时，可以再练一遍。'}</p>
    <div class="course-controls">
      <button type="button" class="course-action" data-action="start">再练一次</button>
      ${retryStation ? `<a class="primary course-action" href="${challengeStationHref(returnToChallenge, returnToStation)}">回这一站再试</a>`
        : returnToChallenge ? `<a class="primary course-action" href="${challengeRouteHref(returnToChallenge, returnToStation)}">完成，回路线</a>`
        : nextLesson ? lessonLink(nextLesson, '去下一课', true) : ''}
    </div>
    ${mode === 'study' && lesson.homeTip ? `<p class="course-home-tip">${courseText(lesson.homeTip)}</p>` : ''}`);
}

function renderPlacementIntro() {
  wrapLesson(`<p class="course-kicker">从会的地方开始</p>
    <h1 tabindex="-1">找找学习起点</h1>
    <p class="course-prompt">用六个小任务，找找下一步适合学什么。</p>
    <p>可以点花、摆花、选数字。拿不准时，点「还不确定」就好。</p>
    <button type="button" class="primary course-action" data-action="start">开始找起点</button>`);
}

function renderPlacementResult() {
  const id = storePlacement(firstGap?.item.nextLesson);
  const recommended = courseLessons.find(item => item.id === id);
  const observation = firstGap?.unsure ? '这题还不确定' : '换一道同类题后，答案还是没有对上';
  const reason = firstGap
    ? `第 ${placementActivities.indexOf(firstGap.item) + 1} 题是「${firstGap.item.skill}」。${observation}，可以先从这里练起。`
    : `${retriedPlacement ? '换题后也答对了，6 项小任务都完成了' : '这 6 个小任务都做对了'}，可以试试把数凑到 10，再接着加。`;
  wrapLesson(`<p class="course-kicker">找到一条可以试的路</p><h1 tabindex="-1">建议先学「${courseText(recommended.title)}」</h1>
    <p>${courseText(reason)}</p>
    <p class="course-note">这是一次起步建议。想练别的，也可以从地图选课。</p>
    ${lessonLink(recommended, '去试这一课', true)}`);
}

courseRoot.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (mode === 'workshop' && courseWorkshop.click(button)) return;
  if ('option' in button.dataset) {
    checkAnswer(options[Number(button.dataset.option)], button);
  } else if ('lineValue' in button.dataset) {
    checkAnswer(Number(button.dataset.lineValue), button);
  } else if ('plot' in button.dataset || 'dot' in button.dataset) {
    toggleCoursePlot(button);
  } else {
    switch (button.dataset.action) {
      case 'hear': {
        const status = button.closest('.course-readout').querySelector('.course-speech-status');
        const onError = () => { status.textContent = '这次没有读出来，可以再点一次。'; };
        status.textContent = '';
        if (!gardenVoice.speak(button.dataset.speech, { onError })) onError();
        break;
      }
      case 'start':
        if (mode === 'review') practiceItems = spacedCoursePractice(lesson, readReviewRecord(lesson.id)?.variant ?? 1);
        else if (mode === 'study') practiceItems = makeCoursePractice(lesson, readResult(lesson)?.attempts ?? 0);
        step = independent = 0;
        renderPractice();
        break;
      case 'challenge-next':
        courseChallenge.next();
        break;
      case 'challenge-retry':
        courseChallenge.retryCurrent();
        break;
      case 'unsure':
        checkAnswer();
        break;
      case 'bundle':
        bundleCourseSticks(button, courseRoot);
        break;
      case 'check-build':
        checkAnswer(courseRoot.querySelectorAll('[data-plot][aria-pressed="true"]').length);
        break;
      case 'hint': {
        usedHelp = true;
        const hint = courseRoot.querySelector('#course-hint');
        hint.hidden = !hint.hidden;
        button.setAttribute('aria-expanded', String(!hint.hidden));
        courseRoot.querySelector('[data-action="example-help"]').hidden = false;
        break;
      }
      case 'example-help': {
        const method = courseRoot.querySelector('#course-method');
        method.hidden = !method.hidden;
        button.setAttribute('aria-expanded', String(!method.hidden));
        break;
      }
      case 'next':
        step += 1;
        if (step === practiceItems.length) renderResult();
        else renderPractice();
        break;
    }
  }
});

courseRoot.addEventListener('submit', event => {
  event.preventDefault();
  const answer = event.target.querySelector('input');
  if (!answer.checkValidity()) return;
  if (mode === 'workshop') courseWorkshop.check(Number(answer.value));
  else checkAnswer(Number(answer.value));
});

function openCourseRoute(route) {
  const [routeType, id, context, skillId] = route.split('/');
  const challengePath = challengePaths.find(path => path.id === id);
  const selectedSkill = challengePath?.skills.find(skill => skill.id === context);
  lesson = ['lesson', 'practice', 'review'].includes(routeType) ? courseLessons.find(item => item.id === id) : null;
  const lessonPath = lesson && challengePaths.find(path => path.id === context);
  returnToStation = lessonPath?.skills.find(skill => skill.id === skillId && skill.lesson === lesson.id);
  returnToChallenge = returnToStation ? lessonPath : null;
  const inChallenge = routeType === 'challenge' && challengePath && (!context || selectedSkill);
  const showRoute = challengePath && (routeType === 'route'
    || (inChallenge && selectedSkill && !canChallengeStation(challengePath, selectedSkill)));
  gardenShell.select(showRoute || inChallenge || returnToChallenge ? 'home' : 'course');
  if (routeType === 'workshop') {
    mode = 'workshop';
    courseWorkshop.open(id);
  } else if (showRoute) {
    mode = 'route';
    renderChallengeRoute(challengePath, selectedSkill);
  } else if (inChallenge) {
    mode = 'challenge';
    courseChallenge.start(challengePath, selectedSkill);
  } else if (route === 'start-check') {
    mode = 'placement';
    practiceItems = placementActivities;
    firstGap = null;
    placementRetry = retriedPlacement = false;
    renderPlacementIntro();
  } else if (lesson) {
    const reviewItems = routeType === 'review' ? spacedCoursePractice(lesson, readReviewRecord(lesson.id)?.variant ?? 1) : null;
    mode = reviewItems ? 'review' : 'study';
    if (mode === 'review' || routeType === 'practice') {
      practiceItems = reviewItems ?? makeCoursePractice(lesson, readResult(lesson)?.attempts ?? 0);
      step = independent = 0;
      renderPractice();
    } else renderExample();
  } else {
    mode = 'map';
    renderMap(route);
    courseRoot.querySelector('h1').focus();
  }
}
