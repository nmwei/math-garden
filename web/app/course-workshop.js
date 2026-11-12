const workshopRoute = '#course/workshop';
const workshopLessons = [...courseStoryWorkshop, ...courseFractionWorkshop];
const workshopTitle = '数学工坊';

function workshopRecordKey(id) {
  return `math-garden:workshop:${id}`;
}

function workshopAttempts(id) {
  const value = readCourseMemory(workshopRecordKey(id));
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function workshopLinks(lessonId) {
  const activities = workshopLessons.filter(activity => activity.lessonId === lessonId);
  return activities.map(activity => `<a class="course-action" href="${workshopRoute}/${activity.id}">试试 · ${courseText(activity.title)}</a>`).join('');
}

function workshopWasStudied(activity) {
  const course = courseLessons.find(item => item.id === activity.lessonId);
  return workshopAttempts(activity.id) > 0 || Boolean(course && readResult(course));
}

function workshopStrategy(activity) {
  const methods = {
    'garden-stall': ['用一样大的格表示每包的价钱，再把另一份的价钱加上', '把所有价钱画成一样长的格，每格当成一包', '先只用带的钱减去一包的价钱'],
    'garden-visit': ['沿时间线标出出发、到达、结束和集合的时刻', '把钟面显示的小时和分钟当作一个整数直接相减', '只看哪一次的分钟数字更大'],
    'garden-fence': ['画出长方形，标出需要围起来的边，再把长度加起来', '先算长方形里面一共能铺多少个方格', '把四条边都当作同样长的边'],
    'garden-votes': ['先看图例每格是几票，再用格数换算票数', '把条形图上的格数直接当成票数', '只数图上有几个活动名称'],
  };
  const [answer, ...others] = methods[activity.id] ?? [
    '先找出整体，确认它怎样被平均分成一样大的份',
    '只看涂了几格，剩下多少格可以不管',
    '先比较哪张图用的颜色更多',
  ];
  return {
    prompt: '开始前，你会先用哪种办法？',
    choices: [answer, ...others],
    answer,
    hint: '读一读最后问的是什么，再看哪个办法能把已知的数量和它连起来。',
    explanation: `可以${answer}。接下来动手试试。`,
  };
}

function makeWorkshopRound(id, attempt) {
  const single = workshopLessons.find(item => item.id === id);
  if (single) return [{ activity: single, task: single.variants[attempt % single.variants.length] }];

  const groups = [[courseStoryWorkshop[0]], courseFractionWorkshop, [...courseStoryWorkshop.slice(1), courseDataWorkshop]];
  const topics = groups.map((group, index) => {
    const studied = group.filter(workshopWasStudied);
    const pool = studied.length ? studied : group;
    const activity = pool[attempt % pool.length];
    const previous = workshopAttempts(activity.id) - 1;
    const variants = activity.variants.filter((_, variant) => variant !== previous % activity.variants.length);
    const visit = Math.floor(attempt / pool.length);
    const task = variants[(visit + index) % variants.length];
    return { activity, task: { ...task, steps: [workshopStrategy(activity), ...task.steps] } };
  });
  const start = attempt % topics.length;
  return [...topics.slice(start), ...topics.slice(0, start)];
}

function renderWorkshopMarks({ labels, kind = 'strip' }, selected) {
  const label = kind === 'edges' ? '边的标记' : kind === 'timeline' ? '时间线的标记' : '格子的标记';
  return `<div class="workshop-marks workshop-${kind}" style="--cells:${labels.length}" role="group" aria-label="${label}">
    ${labels.map((text, index) => selected
      ? `<span class="workshop-cell" data-filled="${selected.includes(index)}">${courseText(text)}${selected.includes(index) ? '<span class="workshop-hidden-label">，已标记</span>' : ''}</span>`
      : `<button type="button" class="course-action workshop-cell" data-workshop-mark="${index}" aria-pressed="false">${courseText(text)}</button>`).join('')}
  </div>`;
}

function renderWorkshopFractionLine({ parts, marks = [] }, selected) {
  return `<div class="workshop-fraction-line" style="--parts:${parts}" role="group" aria-label="从 0 到 1，平均分成 ${parts} 段">
    ${courseCells(parts + 1, index => {
      const label = index === 0 ? '0' : index === parts ? '1' : '';
      const marked = marks.includes(index) || index === selected;
      const name = `${label || `第 ${index} 个分点`}${marked ? '，已标记' : ''}`;
      const attributes = `class="workshop-point${marked ? ' marked' : ''}" style="--position:${100 * index / parts}%" aria-label="${name}"`;
      return selected === undefined
        ? `<button type="button" data-workshop-point="${index}" ${attributes}><span>${label}</span></button>`
        : `<span ${attributes}><span>${index === selected && !label ? `${index}/${parts}` : label}</span></span>`;
    })}
  </div>`;
}

function renderWorkshopInput(item, choices) {
  if (item.marks) {
    return `${renderWorkshopMarks(item.marks)}<button type="button" class="primary course-action" data-workshop="confirm-marks">标好了</button>`;
  }
  if (item.fractionLine) return renderWorkshopFractionLine(item.fractionLine);
  return renderInput(item, choices);
}

function renderWorkshopChart({ model, build }) {
  const columns = Math.max(build.max, ...model.items.map(([, count]) => count));
  return `<div class="workshop-chart" style="--cells:${columns}">
    ${model.items.map(([label, count]) => `<span aria-hidden="true">${courseText(label)}</span>
      <div class="workshop-chart-row" role="img" aria-label="${courseText(label)} ${count} 格">
        ${courseCells(columns, index => `<span class="workshop-cell" data-filled="${index < count}"></span>`)}
      </div>`).join('')}
    <span aria-hidden="true">${courseText(build.label)}</span>
    <div class="workshop-chart-row course-bar-build" role="group" aria-label="${courseText(build.label)}">
      ${courseCells(columns, index => index < build.max
        ? `<button type="button" class="workshop-cell course-action" data-plot data-plot-stop="${index}" aria-pressed="false" aria-label="填到第 ${index + 1} 格">${index + 1}</button>`
        : '<span></span>')}
    </div></div>
    <button type="button" class="primary course-action" data-action="check-build">填好了</button>`;
}

function workshopSketch(item, answer) {
  if (item.marks) {
    const selected = [...courseRoot.querySelectorAll('[data-workshop-mark][aria-pressed="true"]')]
      .map(button => Number(button.dataset.workshopMark));
    return renderWorkshopMarks(item.marks, selected);
  }
  if (item.fractionLine) return renderWorkshopFractionLine(item.fractionLine, answer);
  if (item.build) {
    const fill = answer + (item.build.fixed ?? 0);
    const items = item.model?.kind === 'bars' ? [...item.model.items, [item.build.label, fill]] : [['已标', fill]];
    return renderCourseModel({ kind: 'bars', items });
  }
  return '';
}

const courseWorkshop = (() => {
  let id;
  let round;
  let taskIndex;
  let stepIndex;
  let choices;
  let checked;
  let independent;
  let results;
  let work;

  function page(title, note, content, back = workshopRoute) {
    gardenVoice.stop();
    courseRoot.innerHTML = `<div class="course-top"><a class="course-action" href="${back}">${back === workshopRoute ? '回数学工坊' : '回综合'}</a>
      <span class="course-kicker">综合</span></div>
      <section class="course-panel course-workshop">
        <header class="workshop-heading"><p class="course-kicker">${courseText(note)}</p><h1 tabindex="-1">${courseText(title)}</h1></header>
        ${content}
      </section>`;
    courseRoot.querySelector('h1').focus();
  }

  function activityCards(activities) {
    return `<div class="course-lessons">${activities.map(activity => `<a class="course-lesson" href="${workshopRoute}/${activity.id}">
      <strong>${courseText(activity.title)}</strong><small>${courseText(activity.description)}</small>
    </a>`).join('')}</div>`;
  }

  function list() {
    page(workshopTitle, '动手想一想', `<p>把故事画出来，给分数找位置，试着讲讲你是怎么想的。</p>
      <section class="workshop-group" aria-labelledby="workshop-stories"><h2 id="workshop-stories">生活数学</h2>${activityCards(courseStoryWorkshop)}</section>
      <section class="workshop-group" aria-labelledby="workshop-fractions"><h2 id="workshop-fractions">分数实验</h2>${activityCards(courseFractionWorkshop)}</section>
      <section class="workshop-group workshop-review" aria-labelledby="workshop-review-title">
        <div><h2 id="workshop-review-title">跨主题复习</h2><p>学过几种办法之后，来做三道混合情境题。先想用什么办法，再动手。</p></div>
        <a class="primary course-action" href="${workshopRoute}/mixed">开始混合复习</a>
      </section>`, '#course/grade-3');
  }

  function restart() {
    round = makeWorkshopRound(id, workshopAttempts(id));
    taskIndex = 0;
    results = [];
    startTask();
  }

  function startTask() {
    stepIndex = 0;
    independent = true;
    work = [];
    render();
  }

  function render() {
    const { activity, task } = round[taskIndex];
    const item = task.steps[stepIndex];
    const mixed = id === 'mixed';
    const note = mixed ? `跨主题复习 · 第 ${taskIndex + 1} / ${round.length} 个情境` : workshopTitle;
    const title = mixed ? `一起想想 · 第 ${taskIndex + 1} 题` : activity.title;
    const notes = work.length ? `<details class="workshop-notes"><summary>看看前面的做法</summary>
      <ol>${work.map(({ explanation, sketch }) => `<li>${courseText(explanation)}${sketch}</li>`).join('')}</ol></details>` : '';
    if (!item) {
      page(title, note, `${renderCourseReadout(task.context, '听故事')}${notes}
        <section class="workshop-reflect" aria-labelledby="workshop-reflect-title">
          <h2 id="workshop-reflect-title">说说你的理由</h2>
          ${renderCourseReadout(task.explain, '听问题')}
          <p>可以说给身边的人听，也可以在纸上画一画。</p>
          <details class="course-teaching-answer"><summary>看看一种说法</summary>
            ${renderCourseReadout(task.reflection, '听一种说法')}
          </details>
        </section>
        <button type="button" class="primary course-action" data-workshop="finish-task">${taskIndex + 1 === round.length ? '完成' : '下一道情境题'}</button>`);
      return;
    }

    checked = false;
    choices = shuffleOptions(item.choices ?? []);
    const isChart = item.model?.kind === 'bars' && item.build?.token === 'bar';
    const question = isChart
      ? renderCourseQuestion({ ...item, model: null }, renderWorkshopChart(item))
      : renderCourseQuestion(item, renderWorkshopInput(item, choices));
    page(title, note, `${renderCourseReadout(task.context, '听故事')}${notes}
      <p class="course-progress">第 ${stepIndex + 1} / ${task.steps.length} 步</p>
      <div class="workshop-question">${question}</div>
      <p class="course-status" id="workshop-status" role="status"></p>
      <p class="course-note" id="workshop-hint" hidden>${courseText(item.hint)}</p>
      <div class="course-controls workshop-controls">
        <button type="button" class="course-action" data-workshop="hint" aria-expanded="false" aria-controls="workshop-hint">看提示</button>
        <button type="button" class="primary course-action" data-workshop="next" hidden>${stepIndex + 1 === task.steps.length ? '说说理由' : '下一步'}</button>
      </div>`);
  }

  function check(value, button) {
    if (checked) return;
    const { task } = round[taskIndex];
    const item = task.steps[stepIndex];
    const match = Array.isArray(item.answer)
      ? Array.isArray(value) && value.length === item.answer.length && item.answer.every(index => value.includes(index))
      : value === item.answer;
    const status = courseRoot.querySelector('#workshop-status');
    const buttons = [...courseRoot.querySelectorAll('.workshop-question [data-option], .workshop-question [data-line-value], [data-workshop-point]')];
    showRetryChoice(buttons, match ? undefined : button);
    if (!match) {
      independent = false;
      status.textContent = '再想一想，也可以看提示。';
      playGardenFeedback(false);
      return;
    }

    checked = true;
    button?.classList.add('is-correct');
    work.push({ explanation: item.explanation, sketch: workshopSketch(item, value) });
    status.innerHTML = `${renderCourseFeedback('这一步对啦！', 'correct')} <span class="course-explanation">${courseText(item.explanation)}</span>`;
    for (const control of courseRoot.querySelectorAll('.workshop-question .course-controls :is(button, input), .workshop-question [data-dot]')) {
      control.disabled = true;
    }
    courseRoot.querySelector('[data-workshop="hint"]').hidden = true;
    const next = courseRoot.querySelector('[data-workshop="next"]');
    next.hidden = false;
    next.focus();
    playGardenFeedback(true, button || status);
  }

  async function finishTask() {
    results.push({ activity: round[taskIndex].activity, independent });
    taskIndex += 1;
    if (taskIndex < round.length) {
      startTask();
      return;
    }

    writeCourseMemory(workshopRecordKey(id), workshopAttempts(id) + 1);
    try { await gardenAccount.learningStorage.whenSaved(); } catch { return; }
    const nextLessons = results.filter(result => !result.independent).map(({ activity }) =>
      courseLessons.find(item => item.id === activity.lessonId)).filter(Boolean);
    const lessons = [...new Set(nextLessons)];
    page('做完啦', workshopTitle, `<p>完成了 ${round.length} 个情境，其中 ${results.filter(result => result.independent).length} 个情境每一步都独立答对。</p>
      ${lessons.length ? `<p>想把刚才的方法再看一遍，可以回这几课。</p>
        <div class="course-controls">${lessons.map(item => lessonLink(item, item.title)).join('')}</div>` : ''}
      <div class="course-controls">
        <button type="button" class="primary course-action" data-workshop="restart">换题再试</button>
        <a class="course-action" href="${workshopRoute}">选别的任务</a>
      </div>`);
  }

  function click(button) {
    if ('workshopMark' in button.dataset) {
      toggleCoursePlot(button);
    } else if ('workshopPoint' in button.dataset) {
      check(Number(button.dataset.workshopPoint), button);
    } else if ('option' in button.dataset) {
      check(choices[Number(button.dataset.option)], button);
    } else if ('lineValue' in button.dataset) {
      check(Number(button.dataset.lineValue), button);
    } else if (button.dataset.action === 'check-build') {
      check(courseRoot.querySelectorAll('[data-plot][aria-pressed="true"]').length);
    } else {
      switch (button.dataset.workshop) {
        case 'confirm-marks': {
          const marked = [...courseRoot.querySelectorAll('[data-workshop-mark][aria-pressed="true"]')];
          const item = round[taskIndex].task.steps[stepIndex];
          check(item.marks.markCount ? marked.length : marked.map(cell => Number(cell.dataset.workshopMark)));
          break;
        }
        case 'hint': {
          independent = false;
          const hint = courseRoot.querySelector('#workshop-hint');
          hint.hidden = !hint.hidden;
          button.setAttribute('aria-expanded', String(!hint.hidden));
          break;
        }
        case 'next':
          stepIndex += 1;
          render();
          break;
        case 'finish-task':
          finishTask();
          break;
        case 'restart':
          restart();
          break;
        default:
          return false;
      }
    }
    return true;
  }

  return {
    open(activityId) {
      id = activityId;
      if (id === 'mixed' || workshopLessons.some(activity => activity.id === id)) restart();
      else list();
    },
    click,
    check,
  };
})();
