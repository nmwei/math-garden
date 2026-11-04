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

const homeActivities = {
  foundation: [
    '摆三颗葡萄，请孩子一颗配一个小碟。把葡萄挪开一点，问「还是三颗吗？怎么知道？」',
    '一人摆 4 块积木，另一人照样摆一排。把其中一排拉长一点，看看两排是不是还一样多。',
    '用两种颜色的积木摆「红、蓝、蓝」，重复两组。请孩子接着摆，再指出哪一小组一直在重复。',
    '找一个杯盖、一张方纸和一个三角形纸片。转个方向摆，找找哪些有角、哪些没有角。',
    '放五把勺子，请孩子拿出三把。问她怎么知道拿够了，再一起数桌上还剩几把。',
    '找两条丝带，把一端对齐。先猜哪条长，再用一样大的积木排一排检查。',
  ],
  'grade-1': [
    '准备十颗豆子和两个碗。把十颗豆子分到两个碗里，换一种分法，再说说总数有没有改变。',
    '从 37 开始轮流报数，每人报一个，数到 43。再从 43 倒着数，看看经过 40 时会发生什么。',
    '摆 8 个瓶盖，再拿来 5 个。先用几个把 8 凑成 10？还剩几个没放进去？',
    '拿 26 根短吸管，十根一捆。让孩子用几捆、几根解释 26，再拆开一捆看看总数。',
    '摆出 9 支笔，拿走几支，让孩子看到剩下的 6 支。问她怎么找出拿走了几支。',
    '用 6 个一样大的方纸片拼一个长方形。换个拼法，看看能不能还是长方形。',
  ],
  'grade-2': [
    '给家里每个人摆同样多的水果。想一想，每人几个、几个人和一共几个之间有什么关系。',
    '把 12 块积木按每组 3 块分一分，再试试每组 4 块。比较两次分了几组。',
    '摆 3 排瓶盖，每排 4 个。从另一边看，有几列、每列几个？两个算式的结果一样吗？',
    '找两样家里的小物件，先猜哪样更长，再用尺子从 0 开始量，相差几厘米？',
    '记下家里三种不同颜色的杯子各有几个，一格画一个杯子。哪种最多？多几个？',
    '在纸钟上拨到 3 点半，再往后拨 15 分钟。看看分针走了多少，时针有没有动。',
  ],
  'grade-3': [
    '用同样大的方纸片铺满一个小盒子的底，再用绳子绕盒底一圈。想一想，纸片和绳子在量什么。',
    '用 12 个方纸片分别拼成 2×6 和 3×4 的长方形。面积一样时，沿边数出的周长也一样吗？',
    '把一张纸对折两次，涂其中一小块。再拿同样大的一张纸涂一半，比一比两块涂色面积。',
    '用 17 颗豆子，每 5 颗装一杯。说说能装满几杯、剩几颗；如果每颗都要装，需要几杯？',
    '假设出门路上要 25 分钟，想在 9 点整到。先猜几点出发，再在纸上画时间线检查。',
    '记录三种颜色积木的数量，每格代表 2 块，画一个条形图。如果剩下一块，该画多长？',
  ],
};

function dailyHomeActivity(stage, date = new Date()) {
  const deck = [...homeActivities[stage]];
  // Use the local calendar day; daylight saving changes don't alter the order.
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const cycle = Math.floor(day / deck.length);
  const stageIndex = Object.keys(homeActivities).indexOf(stage);
  const shuffle = (round) => {
    const order = [...deck];
    let seed = (round * 31 + stageIndex + 1) >>> 0;
    for (let index = order.length - 1; index > 0; index -= 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const swap = Math.floor(seed / 4294967296 * (index + 1));
      [order[index], order[swap]] = [order[swap], order[index]];
    }
    return order;
  };
  const order = shuffle(cycle);
  // Swapping the first two leaves the last item unchanged for the next cycle.
  if (order[0] === shuffle(cycle - 1)[order.length - 1]) [order[0], order[1]] = [order[1], order[0]];
  return order[day - cycle * deck.length];
}

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
