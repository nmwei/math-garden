const courseStages = [foundation, gradeOne, gradeTwo, gradeThree];
for (const { stage, after, lesson: addition } of [...bridgeLessons, ...courseExtensions, ...courseEnrichment]) {
  const lessons = courseStages.find(group => group.id === stage).lessons;
  const previous = lessons.findIndex(item => item.id === after);
  lessons.splice(previous + 1, 0, addition);
}
const courseLessons = courseStages.flatMap(stage => stage.lessons);

const placementActivities = [
  {
    nextLesson: 'count-total',
    skill: '换个摆法数总数',
    prompt: '花朵摆开了，一共有几朵？',
    model: { kind: 'dots', groups: [3, 1, 3], touch: true, stagger: true },
    choices: [6, 7, 8], answer: 7,
    retry: {
      prompt: '再数数这边，一共有几朵花？',
      model: { kind: 'dots', groups: [2, 3, 1], touch: true, stagger: true },
      choices: [5, 6, 7], answer: 6,
    },
  },
  {
    nextLesson: 'bridge-quantity-to-ten',
    skill: '按数字摆出数量',
    prompt: '在花坛里放 6 朵花。',
    build: { max: 10, frame: true }, answer: 6,
    retry: { prompt: '在新的花坛里放 8 朵花。', build: { max: 10, frame: true }, answer: 8 },
  },
  {
    nextLesson: 'bridge-missing-part',
    skill: '想想还差几个到 10',
    prompt: '有 6 颗种子，还要几颗才是 10 颗？',
    choices: [3, 4, 5], answer: 4,
    retry: { prompt: '有 7 颗种子，还要几颗才是 10 颗？', choices: [2, 3, 4], answer: 3 },
  },
  {
    nextLesson: 'g1-add-subtract-ten',
    skill: '从故事里算还剩几个',
    prompt: '有 8 个果子，送给朋友 3 个，还剩几个？',
    choices: [3, 5, 7], answer: 5,
    retry: { prompt: '有 9 个果子，送给朋友 2 个，还剩几个？', choices: [6, 7, 8], answer: 7 },
  },
  {
    nextLesson: 'bridge-count-flex',
    skill: '从中间接着数',
    prompt: '38、39、□、41，空格里是什么数？',
    choices: [30, 40, 42], answer: 40,
    retry: { prompt: '58、59、□、61，空格里是什么数？', choices: [50, 60, 62], answer: 60 },
  },
  {
    nextLesson: 'bridge-bundle-ten',
    skill: '认出几个十和几个一',
    prompt: '两捆小棒，每捆 10 根，另外有 4 根。总共有几根？',
    choices: [6, 24, 42], answer: 24,
    retry: { prompt: '三捆小棒，每捆 10 根，另外有 2 根。总共有几根？', choices: [5, 23, 32], answer: 32 },
  },
];

function readResult(item) {
  const result = readCourseMemory(`math-garden:course:${item.id}`);
  if (Number.isInteger(result?.total) && result.total >= item.practice.length && result.total <= Math.max(5, item.practice.length)
    && Number.isInteger(result.independent) && result.independent >= 0 && result.independent <= result.total) {
    return { ...result, attempts: Number.isSafeInteger(result.attempts) && result.attempts > 0 ? result.attempts : 1 };
  }
  return null;
}

function spacedCoursePractice(lesson, variant) {
  const lastStudyAttempt = Math.max(0, (readResult(lesson)?.attempts ?? 1) - 1);
  return makeReviewPractice(lesson.id, variant) ?? makeCourseReview(lesson, variant, lastStudyAttempt);
}

function getStudyPlan(stageId) {
  const selected = courseStages.find(stage => stage.id === stageId);
  const pool = selected?.lessons ?? courseLessons;
  const placement = readPlacement();
  const startingPoint = pool.findIndex(item => item.id === placement);
  const nextLesson = pool.slice(Math.max(0, startingPoint)).find(item => !readResult(item));
  const revisit = pool.find(item => {
    const result = readResult(item);
    return result && result.independent < result.total;
  });
  const today = localDateKey();
  const due = courseLessons.filter(item => {
    const record = readReviewRecord(item.id);
    return record && record.reviewOn <= today && spacedCoursePractice(item, record.variant)?.length;
  }).slice(0, 3);
  return { selected, placement, recommended: nextLesson ?? revisit ?? pool[0], revisit, due };
}

const placementKey = 'math-garden:placement:v1';

function readPlacement() {
  const stored = readCourseMemory(placementKey);
  const ids = placementActivities.map(activity => activity.nextLesson);
  return [...ids, 'bridge-cross-ten'].includes(stored) ? stored : null;
}

function storePlacement(firstGap) {
  const recommendation = firstGap ?? 'bridge-cross-ten';
  writeCourseMemory(placementKey, recommendation);
  return recommendation;
}

function localDateKey(date = new Date(), offset = 0) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
  return [day.getFullYear(), day.getMonth() + 1, day.getDate()].map(part => String(part).padStart(2, '0')).join('-');
}

function readReviewRecord(id) {
  const result = readCourseMemory(`math-garden:review:${id}`);
  if (typeof result?.reviewOn === 'string' && typeof result.practiceOn === 'string'
    && Number.isSafeInteger(result.variant) && result.variant > 0
    && Number.isInteger(result.streak) && result.streak >= 0 && result.streak <= 3) return result;
  return null;
}

function scheduleCourseReview(lesson, allIndependent, date = new Date()) {
  if (!spacedCoursePractice(lesson, 1)?.length) return;
  const id = lesson.id;
  const old = readReviewRecord(id);
  const practiceOn = localDateKey(date);
  const streak = allIndependent
    ? old?.practiceOn === practiceOn && old.streak > 0 ? old.streak : Math.min(3, (old?.streak ?? 0) + 1)
    : 0;
  const reviewOn = localDateKey(date, [1, 1, 3, 7][streak]);
  writeCourseMemory(`math-garden:review:${id}`, { streak, practiceOn, reviewOn, variant: (old?.variant ?? 0) + 1 });
}
