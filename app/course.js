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
let challengeTarget;

function saveResult() {
  writeCourseMemory(`math-garden:course:${lesson.id}`, { independent, total: lesson.practice.length });
}

function stageOf(item) {
  return courseStages.find(stage => stage.lessons.includes(item));
}

function lessonLink(item, text, primary = false) {
  return `<a class="course-action${primary ? ' primary' : ''}" href="#course/lesson/${item.id}">${courseText(text)}</a>`;
}

function reviewLink(item, text) {
  if (!makeReviewPractice(item.id, 1)) return lessonLink(item, text);
  return `<a class="course-action" href="#course/review/${item.id}">${courseText(text)}</a>`;
}

function lessonState(item) {
  const result = readResult(item);
  if (!result) return '可以开始';
  return result.independent === result.total ? '已练 · 独立答对' : '已练 · 可复习';
}

function courseCard(item) {
  return `<a class="course-lesson" href="#course/lesson/${item.id}" aria-label="${courseText(item.title)}">
    <span class="course-card-state">${lessonState(item)}</span>
    <strong>${courseText(item.title)}</strong>
    <small>${courseText(item.goal)}</small>
  </a>`;
}

function renderMap(stageId) {
  const { selected, placement, recommended, revisit, due } = getStudyPlan(stageId);
  const recommendationLabel = recommended.id === placement ? '起点建议'
    : selected ? '本阶段推荐' : placement ? '接下来可以学' : '推荐先学';
  const active = selected ?? stageOf(recommended);
  const review = revisit && revisit !== recommended && !due.includes(revisit)
    ? reviewLink(revisit, `复习 · ${revisit.title}`) : '';
  courseRoot.innerHTML = `
    <header class="garden-page-header">
      <div class="garden-page-heading"><p class="garden-page-kicker">数学小课堂</p><h1 tabindex="-1">数学学习地图</h1></div>
      <p class="garden-page-note"><span aria-hidden="true">✳</span> 按自己的节奏学</p>
    </header>
    <section class="course-hero" aria-labelledby="course-hero-title">
      <div>
        <h2 class="garden-feature-title" id="course-hero-title">从会的地方出发</h2>
        <p>先动手，再用图和数字说清楚。</p>
        <p class="course-note">${recommendationLabel}：「${courseText(recommended.title)}」</p>
        <div class="course-controls">
          ${lessonLink(recommended, '开始推荐课', true)}
          <a class="course-action" href="./">去花园闯关</a>
          ${review}
        </div>
      </div>
      <img src="./assets/garden-hero.svg" alt="" width="420" height="300">
    </section>
    ${due.length ? `<section class="course-panel course-due" aria-labelledby="due-title">
      <h2 id="due-title">今日复习</h2><p>换一组题，再试试上次用过的办法。</p>
      <div class="course-controls">${due.map(item => reviewLink(item, `复习 · ${item.title}`)).join('')}</div>
    </section>` : ''}
    <nav class="course-stages" aria-label="学习阶段">
      ${courseStages.map(stage => `<a class="course-action" href="#course/${stage.id}"${stage === active ? ' aria-current="page"' : ''}>${stage.label}</a>`).join('')}
    </nav>
    <section class="course-panel" aria-labelledby="stage-title">
      <div class="course-top">
        <div><h2 id="stage-title">${courseText(active.title)}</h2><p>${courseText(active.description)}</p></div>
        <span class="course-note">已练 ${active.lessons.filter(item => readResult(item)).length} / ${active.lessons.length} 课</span>
      </div>
      <div class="course-lessons">${active.lessons.map(courseCard).join('')}</div>
      ${renderHomeActivity(active)}
    </section>`;
}

function renderHomeActivity(stage, item) {
  const text = item?.homeTask ?? dailyHomeActivity(stage.id);
  const daily = item?.homeTask ? '' : ` data-home-stage="${stage.id}"`;
  return `<details class="course-home-task"${daily}><summary>在家试一试</summary><p>${courseText(text)}</p></details>`;
}

courseRoot.addEventListener('toggle', ({ target }) => {
  if (target.matches('details[data-home-stage][open]')) {
    target.querySelector('p').textContent = dailyHomeActivity(target.dataset.homeStage);
  }
}, true);

function wrapLesson(content) {
  const stage = lesson ? stageOf(lesson) : null;
  const inChallenge = mode === 'challenge';
  let back = `<a class="course-action" href="${stage ? `#course/${stage.id}` : '#course'}">回学习地图</a>`;
  if (challengeTarget) back = '<a class="course-action" href="#parent/records">返回闯关记录</a>';
  else if (inChallenge || returnToChallenge) back = '<a class="course-action" href="./">回花园闯关</a>';
  courseRoot.innerHTML = `<div class="course-top">
    ${back}
    <span class="course-kicker">${stage?.label ?? (inChallenge ? '花园闯关' : '找起点')}</span>
  </div><section class="course-panel course-done">${content}</section>`;
  courseRoot.querySelector('h1').focus();
}

function renderExample() {
  const { title, goal, example } = lesson;
  wrapLesson(`<p class="course-kicker">先看一个例子</p>
    <h1 tabindex="-1">${courseText(title)}</h1><p>${courseText(goal)}</p>
    <div class="course-model">${renderCourseModel(example.model)}</div>
    <p class="course-prompt">${courseText(example.text)}</p>
    <button type="button" class="primary course-action" data-action="start">开始练习</button>`);
}

function renderInput(item) {
  if (item.build) return renderCourseBuild(item.build);
  if (item.line) return renderCourseLineInput(item.line);
  if (options.length) {
    const disabled = (item.bundles?.ones ?? 0) >= 10 ? ' disabled' : '';
    return `<div class="choices course-choices" role="group" aria-label="答案选项">${options.map((value, index) =>
      `<button type="button" data-option="${index}"${disabled}>${courseText(value)}</button>`).join('')}</div>`;
  }
  return `<form class="course-number-form">
    <label>填入答案 <input class="course-input" inputmode="numeric" pattern="[0-9]+" maxlength="12" required></label>
    <button type="submit" class="primary course-action">确认答案</button>
  </form>`;
}

function renderQuestionBody(item) {
  options = shuffleOptions(item.choices ?? []);
  return `<p class="course-prompt">${courseText(item.prompt)}</p>
    <div class="course-model">${item.bundles ? renderBundleTray(item.bundles.ones) : renderCourseModel(item.model, true)}</div>
    <div class="course-controls">${renderInput(item)}</div>`;
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
    <p class="course-status" role="status"></p>
    <p class="course-note" id="course-hint" hidden>${courseText(item.hint)}</p>
    <div class="course-controls">
      <button type="button" class="course-action" data-action="hint" aria-controls="course-hint" aria-expanded="false">看提示</button>
      <button type="button" class="course-action" data-action="example-help" hidden>看一遍怎么做</button>
      <button type="button" class="primary course-action" data-action="next" hidden>${step + 1 === practiceItems.length ? '看练习结果' : '下一题'}</button>
    </div>`}`);
}

function checkAnswer(value, attempted) {
  if (mode === 'challenge') {
    courseChallenge.answer(value);
    return;
  }
  if (answered) return;
  const item = practiceItems[step];
  if (mode === 'placement') {
    if (!placementRetry && value !== undefined && value !== item.answer) {
      placementRetry = retriedPlacement = true;
      renderPractice();
      return;
    }
    const answer = placementRetry ? item.retry.answer : item.answer;
    if (value !== answer) firstGap ??= { item, unsure: value === undefined };
    placementRetry = false;
    step += 1;
    if (step === practiceItems.length) renderPlacementResult();
    else renderPractice();
    return;
  }
  const status = courseRoot.querySelector('.course-status');
  const buttons = [...courseRoot.querySelectorAll('[data-option], [data-line-value]')];
  showRetryChoice(buttons, value !== item.answer ? attempted : undefined);
  if (value !== item.answer) {
    usedHelp = true;
    status.textContent = '再试一次，也可以看一个提示。';
    return;
  }

  answered = true;
  if (!usedHelp) independent += 1;
  status.textContent = item.explanation;
  status.classList.add('course-correct');
  for (const control of courseRoot.querySelectorAll('[data-option], [data-line-value], [data-plot], [data-dot], [data-action="check-build"], .course-input, [type="submit"]')) {
    control.disabled = true;
  }
  courseRoot.querySelector('[data-action="hint"]').hidden = true;
  courseRoot.querySelector('[data-action="example-help"]').hidden = true;
  const next = courseRoot.querySelector('[data-action="next"]');
  next.hidden = false;
  next.focus();
}

function renderResult() {
  if (mode === 'study') saveResult();
  scheduleCourseReview(lesson.id, independent === practiceItems.length);
  const nextLesson = courseLessons[courseLessons.indexOf(lesson) + 1];
  const retryRoute = returnToChallenge && `${returnToChallenge.id}${challengeTarget ? `/${challengeTarget.id}` : ''}`;
  wrapLesson(`<p class="course-kicker">又长大了一点</p><h1 tabindex="-1">${mode === 'review' ? '这次复习完成啦' : '这一课练完啦'}</h1>
    <p class="course-prompt">本次首次独立答对 ${independent} / ${practiceItems.length} 题</p>
    <p>${independent === practiceItems.length ? '你用自己的办法把这组做完了。' : '用提示找到办法也是在学习。想试试时，可以再练一遍。'}</p>
    <div class="course-controls">
      <button type="button" class="course-action" data-action="start">再练一次</button>
      ${retryRoute ? `<a class="primary course-action" href="#course/challenge/${retryRoute}">回闯关再试</a>`
        : nextLesson ? lessonLink(nextLesson, '去下一课', true) : ''}
    </div>
    ${renderHomeActivity(stageOf(lesson), lesson)}`);
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
  if ('option' in button.dataset) {
    checkAnswer(options[Number(button.dataset.option)], button);
  } else if ('lineValue' in button.dataset) {
    checkAnswer(Number(button.dataset.lineValue), button);
  } else if ('plot' in button.dataset || 'dot' in button.dataset) {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  } else {
    switch (button.dataset.action) {
      case 'start':
        if (mode === 'review') practiceItems = makeReviewPractice(lesson.id, readReviewRecord(lesson.id)?.variant ?? 1);
        step = independent = 0;
        renderPractice();
        break;
      case 'challenge-next':
        courseChallenge.next();
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
      case 'example-help':
        courseRoot.querySelector('.course-status').textContent = practiceItems[step].explanation;
        break;
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
  if (answer.checkValidity()) checkAnswer(Number(answer.value));
});

function openCourseRoute(route) {
  const [routeType, id, context, skillId] = route.split('/');
  const challengePath = challengePaths.find(path => path.id === id);
  const selectedSkill = challengePath?.skills.find(skill => skill.id === context);
  lesson = ['lesson', 'practice', 'review'].includes(routeType) ? courseLessons.find(item => item.id === id) : null;
  returnToChallenge = lesson && challengePaths.find(path => path.id === context);
  const inChallenge = routeType === 'challenge' && challengePath && (!context || selectedSkill);
  challengeTarget = inChallenge ? selectedSkill : returnToChallenge?.skills.find(skill => skill.id === skillId && skill.lesson === lesson.id);
  gardenShell.select(inChallenge || returnToChallenge ? 'home' : 'course');
  if (inChallenge) {
    mode = 'challenge';
    courseChallenge.start(challengePath, selectedSkill);
  } else if (route === 'start-check') {
    mode = 'placement';
    practiceItems = placementActivities;
    firstGap = null;
    placementRetry = retriedPlacement = false;
    renderPlacementIntro();
  } else if (lesson) {
    const reviewItems = routeType === 'review' ? makeReviewPractice(lesson.id, readReviewRecord(lesson.id)?.variant ?? 1) : null;
    mode = reviewItems ? 'review' : 'study';
    practiceItems = reviewItems ?? lesson.practice;
    if (mode === 'review' || routeType === 'practice') {
      step = independent = 0;
      renderPractice();
    } else renderExample();
  } else {
    mode = 'map';
    renderMap(route);
    courseRoot.querySelector('h1').focus();
  }
}
