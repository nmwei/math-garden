// Each checkpoint has four parallel questions. A round uses one, and can use
// the next as a confirmation. A later attempt starts with the other pair.
function challengeSkill(lesson, title, versions, question, id = lesson) {
  return { id, lesson, title, questions: versions.map(question) };
}

function challengeNumber(prompt, answer, model) {
  const nearby = [[-1, 1], [-2, -1], [1, 2]][answer % 3];
  return { prompt, answer, model, choices: [answer, ...nearby.map(offset => answer + offset)] };
}

function challengeBars(items) {
  return { kind: 'bars', items };
}

const challengePaths = [
  {
    id: 'number', title: '数与计算', mark: '123', description: '数花朵、凑成十，再试试乘除法和分数。',
    skills: [
      challengeSkill('count-total', '数出一共有多少', [[3, 2], [2, 2], [2, 1], [1, 1]], groups =>
        challengeNumber('点点花朵，一共有几朵？', groups[0] + groups[1], { kind: 'dots', groups, touch: true, stagger: true })),
      challengeSkill('bridge-quantity-to-ten', '照着数字摆花', [6, 8, 7, 9], answer =>
        ({ prompt: `在十格花坛里摆 ${answer} 朵花。`, build: { max: 10, frame: true }, answer })),
      challengeSkill('parts-and-whole', '把两组花合起来', [[3, 4], [2, 6], [5, 4], [1, 5]], groups =>
        challengeNumber('两组花合起来，一共有几朵？', groups[0] + groups[1], { kind: 'dots', groups })),
      challengeSkill('g1-make-five-ten', '找出还差几个到 10', [8, 6, 7, 5], filled =>
        challengeNumber('还要填几格，才能凑满 10 格？', 10 - filled, { kind: 'frame', filled })),
      challengeSkill('g1-add-subtract-ten', '算出拿走后还剩几个', [[9, 4], [7, 3], [10, 2], [8, 6]], ([total, taken]) =>
        challengeNumber(`篮子里有 ${total} 个果子，拿走 ${taken} 个。还剩几个？`, total - taken)),
      challengeSkill('g1-tens-and-ones', '认出几个十和几个一', [[3, 6], [5, 2], [2, 7], [4, 8]], ([tens, ones]) =>
        ({ prompt: `有 ${tens} 捆小棒，每捆 10 根，还有 ${ones} 根散棒。一共有几根？`,
          answer: tens * 10 + ones, choices: [tens * 10 + ones, ones * 10 + tens, tens + ones] })),
      challengeSkill('g1-within-twenty', '算出进位加法', [[8, 5], [7, 5], [9, 7], [6, 8]], ([a, b]) =>
        challengeNumber(`${a} ＋ ${b} 等于几？`, a + b)),
      challengeSkill('numbers-within-10000', '读懂千、百、十、个位', [[2, 4, 0, 5], [3, 1, 0, 7], [5, 3, 0, 4], [1, 8, 0, 2]], digits =>
        ({ prompt: '这些千、百、十、个合起来是多少？', answer: Number(digits.join('')),
          choices: [Number(digits.join('')), digits[0] * 1000 + digits[1] * 10 + digits[3], digits[1] * 1000 + digits[0] * 100 + digits[3]],
          model: { kind: 'place', digits, labels: ['千', '百', '十', '个'] } })),
      challengeSkill('regroup-add-subtract', '算出退位减法', [[53, 26], [71, 35], [62, 14], [84, 57]], ([a, b]) =>
        challengeNumber(`${a} − ${b} 等于几？`, a - b)),
      challengeSkill('equal-groups-multiply', '用乘法数相同的几组', [[3, 4], [5, 3], [4, 6], [2, 7]], ([rows, cols]) =>
        ({ prompt: `有 ${rows} 排花，每排 ${cols} 朵。一共有几朵？`, answer: rows * cols, choices: [rows * cols, rows + cols, (rows + 1) * cols] })),
      challengeSkill('share-and-group', '把物品平均分', [[18, 3], [24, 4], [20, 5], [28, 7]], ([total, groups]) =>
        challengeNumber(`把 ${total} 颗种子平均放进 ${groups} 个花盆，每盆几颗？`, total / groups)),
      challengeSkill('large-numbers', '估到最接近的整千数', [1260, 3780, 6190, 8540], value => {
        const lower = Math.floor(value / 1000) * 1000;
        return { prompt: `${value} 最接近哪个整千数？`, answer: Math.round(value / 1000) * 1000, choices: [lower, lower + 1000, lower + 2000] };
      }),
      challengeSkill('written-multiply', '算出两位数乘两位数', [[23, 12], [14, 21], [32, 14], [21, 24]], ([a, b]) =>
        ({ prompt: `${a} × ${b} 等于几？`, answer: a * b, choices: [a * b, a * (b % 10), a * b + 10] })),
      challengeSkill('written-divide', '算出除法的商和余数', [[47, 5], [35, 4], [57, 8], [40, 6]], ([a, b]) => {
        const quotient = Math.floor(a / b);
        return { prompt: `${a} 颗种子每 ${b} 颗装一袋，能装满几袋？还剩几颗？`,
          answer: `${quotient} 袋，剩 ${a % b} 颗`, choices: [`${quotient} 袋，剩 ${a % b} 颗`, `${quotient} 袋，剩 0 颗`, `${quotient - 1} 袋，剩 ${a % b} 颗`] };
      }),
      challengeSkill('first-fractions', '用分数表示涂色部分', [[5, 2], [7, 3], [8, 5], [6, 1]], ([parts, filled]) =>
        ({ prompt: '涂色部分占整个长条的几分之几？', answer: `${filled}/${parts}`,
          choices: [`${filled}/${parts}`, `${parts}/${filled}`, `${parts - filled}/${parts}`], model: { kind: 'fraction', parts, filled } })),
      challengeSkill('first-decimals', '把十分之几写成小数', [2, 6, 3, 8], filled =>
        ({ prompt: '把整个长条看作 1。涂色部分用小数怎么写？', answer: `0.${filled}`,
          choices: [`0.${filled}`, `${filled}.0`, `0.0${filled}`], model: { kind: 'fraction', parts: 10, filled } })),
    ],
  },
  {
    id: 'shape', title: '图形与规律', mark: '△○', description: '找边和角，接上规律，看看图形怎么变。',
    skills: [
      challengeSkill('shape-sides', '用直边认图形', [3, 0, 4, 3], (sides, index) => {
        const shapes = ['triangle', 'circle', 'square'];
        const arrangement = index === 3 ? [...shapes].reverse() : [...shapes.slice(index), ...shapes.slice(0, index)];
        const names = { 0: '圆形', 3: '三角形', 4: '正方形' };
        return { prompt: sides === 0 ? '哪个图形没有直边？' : `哪个图形有 ${sides} 条直边？`,
          answer: names[sides], choices: Object.values(names), model: { kind: 'shapes', items: arrangement } };
      }),
      challengeSkill('repeat-unit', '接着排重复的小组', [
        ['circle', 'triangle'], ['square', 'circle'], ['triangle', 'triangle', 'circle'], ['square', 'circle', 'square'],
      ], unit => {
        const names = { circle: '圆形', triangle: '三角形', square: '正方形' };
        return { prompt: '照这样接着排，下一个是什么？', model: { kind: 'shapes', items: [...unit, ...unit, ...unit.slice(0, -1)] },
          answer: names[unit.at(-1)], choices: Object.values(names) };
      }),
      challengeSkill('g1-shape-groups', '区分平面和立体图形', [
        ['圆柱', 'cylinder'], ['正方体', 'cube'], ['球', 'sphere'], ['圆形', 'circle'],
      ], ([answer, shape]) => {
        const flat = shape === 'circle';
        return { prompt: flat ? '哪个图形可以画在纸上，是平面图形？' : '哪个是有厚度的立体图形？',
          answer, choices: flat ? [answer, '球', '正方体'] : ['三角形', answer, '正方形'],
          model: { kind: 'shapes', items: flat ? [shape, 'sphere', 'cube'] : ['triangle', shape, 'square'] } };
      }),
      challengeSkill('g1-position-and-order', '从指定方向数位置', [['左', 2], ['右', 2], ['右', 1], ['左', 3]], ([side, position]) => {
        const names = ['圆形', '三角形', '正方形', '长方形'];
        return { prompt: `从${side}边数，第 ${position} 个是什么图形？`, choices: names,
          answer: names[side === '左' ? position - 1 : names.length - position], model: { kind: 'shapes', items: ['circle', 'triangle', 'square', 'rectangle'] } };
      }),
      challengeSkill('g2-turn-and-reflect', '想象箭头转四分之一圈', ['↑', '→', '↓', '←'], (arrow, index) => {
        const turns = ['↑', '→', '↓', '←'];
        return { prompt: '照钟表指针转动的方向，转四分之一圈。箭头朝哪里？', model: { kind: 'text', text: arrow },
          answer: turns[(index + 1) % 4], choices: turns };
      }),
      challengeSkill('g2-turn-and-reflect', '找出镜子里的方向', [['↖', '↗'], ['↘', '↙'], ['↗', '↖'], ['↙', '↘']], ([arrow, answer]) =>
        ({ prompt: '沿竖线照镜子，另一边的箭头会朝哪里？', model: { kind: 'text', text: `${arrow} │ ？` },
          answer, choices: ['↖', '↗', '↘', '↙'] }), 'mirror-direction'),
      challengeSkill('g3-right-acute-obtuse', '比较角的张口', [[2, '锐角'], [4, '钝角'], [3, '直角'], [5, '钝角']], ([hour, answer]) =>
        ({ prompt: '钟面两根针夹成的较小的角是什么角？', model: { kind: 'clock', hour, minute: 0 },
          answer, choices: ['锐角', '直角', '钝角'] })),
      challengeSkill('perimeter', '沿着图形边缘量一圈', [[3, 5], [4, 7], [6, 2], [3, 8]], ([rows, cols]) =>
        ({ prompt: `花坛长 ${cols} 米、宽 ${rows} 米。沿花坛走一圈是多少米？`, answer: 2 * (rows + cols),
          choices: [2 * (rows + cols), rows + cols, 2 * cols + rows], model: { kind: 'grid', rows, cols, outline: true } })),
      challengeSkill('area', '用小方格量面积', [[2, 5], [3, 6], [4, 5], [3, 7]], ([rows, cols]) =>
        ({ prompt: '每小格是 1 平方厘米，整个长方形有多少平方厘米？', answer: rows * cols,
          choices: [rows * cols, rows + cols, rows * cols - 1], model: { kind: 'grid', rows, cols } })),
    ],
  },
  {
    id: 'measure', title: '测量与数据', mark: '▥', description: '比长短、读钟表，找出图表里的答案。',
    skills: [
      challengeSkill('compare-measure-sort', '用一样长的小格比长短', [[4, 6], [5, 3], [7, 4], [3, 6]], ([a, b]) =>
        ({ prompt: '每格一样长，哪条更长？', answer: a > b ? '甲' : '乙', choices: ['甲', '乙', '一样长'],
          model: challengeBars([['甲', a], ['乙', b]]) })),
      challengeSkill('g1-time-and-length', '从钟面上读整时', [3, 8, 6, 11], hour =>
        ({ prompt: '钟面上是几点整？', answer: `${hour} 点`, choices: [`${hour - 1} 点`, `${hour} 点`, `${hour + 1} 点`],
          model: { kind: 'clock', hour, minute: 0 } })),
      challengeSkill('clock-coins', '读出几点半', [4, 7, 2, 10], hour =>
        ({ prompt: '现在是几点半？', answer: `${hour} 点半`, choices: [`${hour - 1} 点半`, `${hour} 点半`, `${hour + 1} 点半`],
          model: { kind: 'clock', hour, minute: 30 } })),
      challengeSkill('measure-and-turn', '为物品选合适的长度单位', [['一张课桌长约 1', '米'], ['一块橡皮长约 4', '厘米'], ['小路长约 6', '米'], ['一片叶子长约 8', '厘米']], ([object, answer]) =>
        ({ prompt: `${object} 什么？`, answer, choices: ['米', '厘米', '千克'] })),
      challengeSkill('g2-survey-and-chart-key', '读懂每格代表多少', [[3, 2], [4, 2], [2, 5], [3, 5]], ([cells, scale]) =>
        ({ prompt: `图里每格代表 ${scale} 人，有多少人喜欢浇花？`, answer: cells * scale,
          choices: [cells, cells * scale, (cells + 1) * scale], model: challengeBars([['浇花', cells], ['种花', cells + 1]]) })),
      challengeSkill('g3-measure-intervals', '用两个刻度之间的距离量长度', [[2, 7], [3, 9], [4, 8], [1, 8]], ([start, end]) =>
        challengeNumber(`花签左端在 ${start} 厘米，右端在 ${end} 厘米。它有多长？`, end - start,
          { kind: 'line', min: 0, max: 10, marks: [start, end], jump: [start, end] })),
      challengeSkill('read-data', '用图表比较相差多少', [[7, 4], [8, 3], [6, 2], [9, 3]], ([a, b]) =>
        challengeNumber('圆花盆比方花盆多几个？', a - b, challengeBars([['圆花盆', a], ['方花盆', b]]))),
      challengeSkill('garden-guide', '在米和厘米之间换算', [[1, 20], [2, 30], [3, 50], [4, 15]], ([metres, centimetres]) =>
        ({ prompt: `${metres} 米 ${centimetres} 厘米，一共是多少厘米？`, answer: metres * 100 + centimetres,
          choices: [metres * 100 + centimetres, metres * 10 + centimetres, metres * 100] })),
    ],
  },
];

const challengeOutcomeLabels = {
  independent: '独立做对', retry: '换题后做对', practice: '可以再练', unsure: '还不确定',
};

function challengeRecordKey(path, skill) {
  return `math-garden:challenge:v1:${path.id}:${skill.id}`;
}

function readChallengeRecord(path, skill) {
  const record = readCourseMemory(challengeRecordKey(path, skill));
  return Number.isSafeInteger(record?.attempts) && record.attempts > 0
    && Object.hasOwn(challengeOutcomeLabels, record.outcome) ? record : null;
}

function challengePassed(outcome) {
  return outcome === 'independent' || outcome === 'retry';
}

function saveChallengeRecord(path, skill, outcome) {
  const previous = readChallengeRecord(path, skill);
  const key = challengeRecordKey(path, skill);
  writeCourseMemory(key, {
    attempts: (previous?.attempts ?? 0) + 1,
    outcome: challengePassed(previous?.outcome) ? previous.outcome : outcome,
  });
}

function nextChallengeIndex(path) {
  const index = path.skills.findIndex(skill => !challengePassed(readChallengeRecord(path, skill)?.outcome));
  return index === -1 ? path.skills.length : index;
}

function completedChallengeCount(path) {
  return path.skills.filter(skill => challengePassed(readChallengeRecord(path, skill)?.outcome)).length;
}

function challengeLesson(skill) {
  return courseLessons.find(item => item.id === skill.lesson);
}

function canChallengeStation(path, skill, nextIndex = nextChallengeIndex(path)) {
  return path.skills[nextIndex] === skill || challengePassed(readChallengeRecord(path, skill)?.outcome);
}

function challengeRouteHref(path, skill) {
  return `#course/route/${path.id}${skill ? `/${skill.id}` : ''}`;
}

function challengeStationHref(path, skill) {
  return `#course/challenge/${path.id}/${skill.id}`;
}

function challengeLessonHref(path, skill) {
  return `#course/lesson/${skill.lesson}/${path.id}/${skill.id}`;
}
