// Practice keeps the skill fixed while changing the quantities, layout, or context.
// Challenge stations and scheduled reviews each have their own separate questions.
const coursePracticeVariants = (() => {
  const q = (prompt, answer, hint, explanation, input = {}) => ({ prompt, answer, hint, explanation, ...input });
  const near = (answer, min = 0, max = Infinity) => {
    const start = Math.max(min, Math.min(answer - 1, max - 2));
    return [start, start + 1, start + 2];
  };
  const number = (prompt, answer, hint, explanation, model, choices = near(answer)) =>
    q(prompt, answer, hint, explanation, { choices, ...(model && { model }) });
  const dots = (...groups) => ({ kind: 'dots', groups, touch: true });
  const shapes = (...items) => ({ kind: 'shapes', items });
  const frame = filled => ({ kind: 'frame', filled });
  const grid = (rows, cols, outline = false) => ({ kind: 'grid', rows, cols, outline });
  const place = (value, labels) => ({
    kind: 'place', digits: String(value).padStart(labels.length, '0').split('').map(Number), labels,
  });
  const textModel = text => ({ kind: 'text', text });
  const pick = (items, round) => items[round % items.length];
  const shapeNames = { circle: '圆形', square: '正方形', triangle: '三角形', rectangle: '长方形' };

  function count(groups, max) {
    const total = groups.reduce((sum, group) => sum + group, 0);
    return number('这些花一共有几朵？', total, '每一排都看一遍，每朵只点一次。',
      `最后数到 ${total}，一共就是 ${total} 朵。`, dots(...groups), near(total, 1, max));
  }

  function plant(target, max, fixed = 0) {
    const extra = target - fixed;
    return q(fixed ? `已经有 ${fixed} 朵花。请接着摆，让花坛里一共有 ${target} 朵。` : `请在花坛里摆出 ${target} 朵花。`,
      extra, fixed ? `从 ${fixed} 接着数，每放一朵数一下。` : '每摆一朵就数一下，数到题目里的数就停。',
      fixed ? `原来的 ${fixed} 朵和新摆的 ${extra} 朵合起来，正好是 ${target} 朵。` : `花坛里正好有 ${target} 朵花。`,
      { build: { max, fixed, frame: max === 10 } });
  }

  function gap(total, part, model) {
    const answer = total - part;
    return number(`要准备 ${total} 张花签，已经有 ${part} 张。还缺几张？`, answer,
      `从 ${part} 接着数到 ${total}，看看多了多少。`, `${part} 加 ${answer} 就是 ${total}，还缺 ${answer} 张。`, model);
  }

  function remaining(total, removed, model) {
    const answer = total - removed;
    return number(`花篮里有 ${total} 个松果，拿走 ${removed} 个，还剩几个？`, answer,
      '先想想原来有多少，再划掉拿走的那些。', `${total} − ${removed} = ${answer}，还剩 ${answer} 个松果。`, model);
  }

  function sequence(unit, next, repair = false) {
    const items = [...unit, ...unit, ...unit];
    const names = [...new Set(unit.map(shape => shapeNames[shape]))];
    const answer = shapeNames[items[next]];
    const prompt = repair
      ? `按「${unit.map(shape => shapeNames[shape]).join('、')}」重复摆放。第 ${next + 1} 个放错了，要换成什么？`
      : '看前面两组的摆法，接下来的图形是什么？';
    if (repair) items[next] = items[next] === 'circle' ? 'square' : 'circle';
    else items.length = next;
    return q(prompt, answer, '找出每一小组的开头，再看这一格在小组里的位置。',
      `每组都是「${unit.map(shape => shapeNames[shape]).join('、')}」。这里要放${answer}。`,
      { model: shapes(...items), choices: [...new Set([...names, '圆形', '三角形', '正方形'])] });
  }

  function addition(left, right, hint = '把两部分合起来。', model) {
    return number(`${left} + ${right} 等于多少？`, left + right, hint,
      `${left} 和 ${right} 合起来是 ${left + right}。`, model);
  }

  function lineWalk(from, steps) {
    const to = from + steps;
    const direction = steps > 0 ? '右' : '左';
    return q(`从 ${from} 出发，向${direction}走 ${Math.abs(steps)} 小格，到哪个数？`, to,
      '从起点后的一格开始计数，起点不算走了一格。', `从 ${from} 向${direction}走 ${Math.abs(steps)} 小格，到 ${to}。`,
      { line: { min: Math.min(from, to) - 2, max: Math.max(from, to) + 2, marks: [from] } });
  }

  function hourQuestion(hour, minute = 0) {
    const time = (value, mins = minute) => `${value}:${String(mins).padStart(2, '0')}`;
    const wrongMinute = minute ? time(hour, (minute + 5) % 60) : time((hour + 10) % 12 + 1);
    return q('钟面上是几点？', time(hour), minute ? '长针每走一个小格就是一分钟，先看短针刚过几。' : '长针指着 12 时，看短针指着几。',
      minute ? `短针刚过 ${hour}，分针从 12 走了 ${minute} 分钟，是 ${time(hour)}。` : `短针指向 ${hour}，长针指向 12，是 ${hour} 点整。`,
      { model: { kind: 'clock', hour, minute }, choices: [time(hour), time(hour % 12 + 1), wrongMinute] });
  }

  function bars(a, b, c, key = 1) {
    const answer = (a - b) * key;
    return number(`${key === 1 ? '每格代表 1 张' : `每格代表 ${key} 张`}。叶子票比花朵票多几张？`, answer,
      '先比相差几格，再看一格代表几张。', `两条相差 ${a - b} 格，每格 ${key} 张，所以相差 ${answer} 张。`,
      { kind: 'bars', items: [['叶子', a], ['花朵', b], ['果子', c]] });
  }

  function equalGroups(groups, size) {
    return number(`有 ${groups} 盘点心，每盘放 ${size} 块。一共多少块？`, groups * size,
      '每一盘都一样多，可以把一盘看作一组。', `${groups} 组，每组 ${size} 块，一共 ${groups * size} 块。`,
      grid(groups, size), [groups + size, groups * size, groups * size + size]);
  }

  function division(groups, size, leftover = 0) {
    const total = groups * size + leftover;
    return number(`${total} 颗豆子每 ${size} 颗装满一袋，能装满几袋？`, groups,
      '每次拿出一样多，只数能装满的袋。', `${groups} 袋用掉 ${groups * size} 颗${leftover ? `，剩 ${leftover} 颗，装不满另一袋` : '，正好用完'}。`);
  }

  return {
    'notice-small': round => [
      count(pick([[2], [1, 2], [2, 1], [1, 1, 1]], round), 3),
      plant(pick([2, 3, 1], round), 3),
    ],
    'count-total': round => [
      count(pick([[1, 3], [3, 2], [1, 1, 2], [1, 2]], round), 5),
      count(pick([[2, 1, 1], [2, 3], [1, 4], [1, 2, 1]], round), 5),
    ],
    'make-a-set': round => [plant(pick([4, 1, 3, 5], round), 5), plant(pick([3, 5, 4, 2], round), 5, 1)],
    'bridge-quantity-to-ten': round => [
      plant(pick([9, 6, 7, 8], round), 10), plant(pick([8, 9, 6, 7], round), 10, 5),
    ],
    'none-and-more': round => {
      const [top, bottom] = pick([[4, 2], [2, 2], [1, 3], [0, 1]], round);
      const comparison = top === bottom ? '一样多' : top < bottom ? '上面' : '下面';
      const moved = pick([2, 3, 4, 5], round);
      return [
        q('哪一排花更少？', comparison, '可以从一边开始，让两排花一朵配一朵。',
          `上面 ${top} 朵，下面 ${bottom} 朵，${comparison === '一样多' ? '一样多' : comparison + '更少'}。`,
          { model: dots(top, bottom), choices: ['上面', '下面', '一样多'] }),
        number(`花篮里原有 ${moved} 朵花，都送给了朋友。现在花篮里有几朵？`, 0,
          '想想「都送给了朋友」以后，篮子里还有花吗？', '篮子里一朵也没有，用 0 表示。', dots(0)),
      ];
    },
    'bridge-same-amount': round => {
      const total = pick([4, 5, 6, 7], round);
      const first = pick([1, 2, 1, 3], round);
      return [
        number(`原来有 ${total} 朵花，只把其中 ${first} 朵挪到了下面。现在一共有几朵？`,
          total, '想一想，刚才有没有拿走或添进花？', `只是换了位置，花的总数还是 ${total}。`, dots(total - first, first)),
        q(`原来有 ${total} 颗石子。怎样做，石子还是 ${total} 颗？`, '拉开一点摆',
          '只移动位置，石子的个数会变吗？', '每颗石子都还在，位置不同也一样多。',
          { choices: ['拿走一颗', '再放一颗', '拉开一点摆'] }),
      ];
    },
    'bridge-match-pairs': round => {
      const [flowers, pots] = pick([[6, 4], [3, 5], [7, 6], [4, 7]], round);
      const more = Math.max(flowers, pots);
      const fewer = Math.min(flowers, pots);
      return [
        number(`有 ${flowers} 朵花和 ${pots} 个花盆，一朵花配一个盆，能配成几对？`,
          fewer, '两边都还有东西时，才能再配一对。', `比较少的一边只有 ${fewer} 个，最多能配 ${fewer} 对。`),
        number(`有 ${more} 把铲子和 ${fewer} 个小桶。每桶配一把铲子，有几把铲子没有桶？`,
          more - fewer, '让每个桶先配一把，再数没有配上的铲子。', `${more} 把配掉 ${fewer} 把，还多出 ${more - fewer} 把。`),
      ];
    },
    'parts-and-whole': round => {
      const [left, right] = pick([[2, 3], [1, 2], [3, 1], [2, 1]], round);
      return [
        number('把两排花合起来，有几朵？', left + right, '先数一排，再从这个数接着数另一排。',
          `${left} 朵和 ${right} 朵放到一起，就是 ${left + right} 朵。`, dots(left, right), near(left + right, 1, 5)),
        remaining(left + right, left, dots(left + right)),
      ];
    },
    'shape-sides': round => {
      const [items, answer, property, explanation] = pick([
        [['square', 'circle', 'triangle'], '圆形', '没有角', '圆形的边缘是弯的，没有角。'],
        [['triangle', 'square', 'circle'], '三角形', '有 3 条直边', '三角形有 3 条直边，也有 3 个角。'],
        [['circle', 'triangle', 'rectangle'], '长方形', '有 4 个角', '这里有四个角的是长方形。'],
        [['square', 'circle', 'triangle'], '正方形', '有 4 条一样长的直边', '正方形的四条边都是直的，长度也一样。'],
      ], round);
      const [figure, sides] = pick([['triangle', 3], ['rectangle', 4], ['circle', 0], ['square', 4]], round);
      return [
        q(`哪一个图形${property}？`, answer, '沿着图形的边走一圈，看看边和角。', explanation,
          { model: shapes(...items), choices: items.map(shape => shapeNames[shape]) }),
        number('图中的形状有几条直边？', sides, '手指沿着边走，弯的地方不算直边。',
          `${shapeNames[figure]}${sides ? '有 ' + sides + ' 条直边' : '没有直边'}。`, shapes(figure)),
      ];
    },
    'compose-shapes': round => {
      const [rows, cols, layout] = pick([[2, 4, 'sideBySide'], [3, 2, 'stacked'], [1, 5, 'sideBySide'], [2, 2, 'stacked']], round);
      const answer = rows === cols ? '正方形' : '长方形';
      return [
        q('方纸片这样拼在一起，最外面是什么形状？', answer,
          '只沿外边走一圈，里面的拼缝不算外边。',
          `这个图有四个方方的角。${rows === cols ? '四条外边一样长' : '两对外边一样长，四条外边不全一样长'}，是${answer}。`,
          { model: grid(rows, cols), choices: ['三角形', '长方形', '正方形'] }),
        number('图中的虚线是一条拼缝。沿拼缝拆开，得到几块纸片？', 2,
          '先找虚线的一边，再找另一边。', '拼缝把整张纸分成两块。',
          { kind: 'shape-puzzle', layout }),
      ];
    },
    'repeat-unit': round => [
      sequence(pick([['circle', 'square', 'triangle'], ['square', 'circle'], ['triangle', 'triangle', 'square']], round),
        pick([7, 4, 8], round)),
      sequence(pick([['square', 'square', 'circle'], ['triangle', 'circle', 'triangle'], ['circle', 'triangle', 'square']], round), 8),
    ],
    'repair-a-pattern': round => [
      sequence(pick([['triangle', 'square'], ['square', 'triangle'], ['circle', 'square']], round), 3, true),
      sequence(pick([['circle', 'square', 'circle'], ['square', 'triangle', 'triangle'], ['triangle', 'circle', 'square']], round), 5, true),
    ],
    'compare-measure-sort': round => {
      const [a, b, c] = pick([[5, 3, 4], [4, 2, 6], [3, 5, 4], [4, 6, 3]], round);
      const longest = ['甲', '乙', '丙'][[a, b, c].indexOf(Math.max(a, b, c))];
      const [rule, answer, options, reason] = pick([
        ['没有角', '圆形杯垫', ['三角旗', '圆形杯垫', '正方形纸片'], '圆形杯垫的边是弯的，没有角。'],
        ['有 3 个角', '三角旗', ['三角旗', '圆形杯垫', '正方形纸片'], '三角旗的边拐了三次，有三个角。'],
        ['用来画画', '彩笔', ['小皮球', '彩笔', '水杯'], '彩笔可以拿来画画。'],
        ['是水果', '梨', ['积木', '小花盆', '梨'], '梨属于水果这一类。'],
      ], round);
      return [
        q('每格同样长。哪一根纸条最长？', longest, '让一端对齐，再数每根占几格。',
          `甲占 ${a} 格，乙占 ${b} 格，丙占 ${c} 格。${longest}占的格子最多。`,
          { model: { kind: 'bars', items: [['甲', a], ['乙', b], ['丙', c]] }, choices: ['甲', '乙', '丙'] }),
        q(`按「${rule}」分出一组，哪样东西可以放进来？`, answer, '每一样都按同一条规则想一遍。',
          reason, { choices: options }),
      ];
    },
    'g1-numbers-to-ten': round => {
      const [left, right] = pick([[5, 4], [3, 5], [5, 5], [4, 4]], round);
      return [
        count([left, right], 10),
        number(`花签上写了 ${left + right} 和 ${left}，哪个数大？`, left + right,
          '比较两个数代表的数量。', `${left + right} 比 ${left} 多 ${right}，所以 ${left + right} 大。`,
          undefined, [left, left + right]),
      ];
    },
    'g1-make-five-ten': round => [
      gap(5, pick([4, 1, 3, 2], round)), gap(10, pick([5, 8, 3, 9], round), frame(pick([5, 8, 3, 9], round))),
    ],
    'bridge-missing-part': round => {
      const [total, part] = pick([[9, 3], [7, 5], [8, 5], [10, 6]], round);
      return [
        gap(total, part, { kind: 'tape', total, parts: [{ label: part, size: part }, { label: '?', size: total - part }] }),
        number(`两盒一共有 ${total} 颗种子。打开其中一盒，数到 ${total - part} 颗。没打开的盒子里有几颗？`,
          part, '用总数减掉看得见的这一部分。', `${total} − ${total - part} = ${part}，没打开的盒子里有 ${part} 颗。`),
      ];
    },
    'g1-add-subtract-ten': round => {
      const [left, right] = pick([[6, 2], [2, 5], [4, 4], [5, 4]], round);
      return [addition(left, right, '从一堆的数量继续往后数。', dots(left, right)), remaining(left + right, left)];
    },
    'bridge-count-flex': round => [
      lineWalk(pick([42, 59, 31, 75], round), 1), lineWalk(pick([60, 43, 30, 86], round), -1),
    ],
    'bridge-cross-ten': round => {
      const [start, add] = pick([[7, 5], [9, 4], [8, 5], [8, 4]], round);
      const toTen = 10 - start;
      return [
        addition(start, add, `先从要加的数中拿出 ${toTen} 凑到 10，再数还剩几个要加。`, frame(start)),
        number(`从 ${start + add} 开始，减 ${add} 可以先减几到 10？`, start + add - 10,
          '先看这个数比 10 多了几个一。', `${start + add} 减 ${add - toTen} 先到 10，然后再减 ${toTen}。`),
      ];
    },
    'g1-within-twenty': round => {
      const [start, add] = pick([[8, 7], [6, 8], [9, 8], [7, 6]], round);
      return [
        addition(start, add, '先凑满 10，再加没有用完的部分。', frame(start)),
        number(`${start + add} − ${start} 等于多少？`, add, '先从十几减到 10，再减去剩下的部分。',
          `${start + add} − ${start + add - 10} = 10，${start} 还剩 ${10 - add} 要减，所以答案是 ${add}。`),
      ];
    },
    'bridge-bundle-ten': round => {
      const [tens, ones] = pick([[3, 7], [4, 6], [2, 8], [5, 9]], round);
      return [
        number(`${tens} 捆木棒，每捆 10 根，另有 ${ones} 根散棒。一共几根？`, 10 * tens + ones,
          '先一捆一捆数十，再接着数散棒。', `${tens} 个十和 ${ones} 个一组成 ${10 * tens + ones}。`,
          undefined, [10 * tens + ones, 10 * ones + tens, tens + ones]),
        number(`有 ${10 * tens + ones} 根木棒。每 10 根捆一捆，散棒最后还剩几根？`, ones,
          '十位表示能捆起来的组数，个位表示余下的散棒数。', `${10 * tens + ones} 里有 ${tens} 个十和 ${ones} 个一。`),
      ];
    },
    'g1-tens-and-ones': round => {
      const [a, b] = pick([[46, 64], [57, 75], [82, 28], [39, 93]], round);
      return [
        number('数位表上的数是多少？', a, '十位和个位按顺序读。', `${Math.floor(a / 10)} 个十和 ${a % 10} 个一是 ${a}。`,
          place(a, ['十', '一']), [a, b, Math.floor(a / 10) + a % 10]),
        number(`${a} 和 ${b}，哪个数大？`, Math.max(a, b), '先看十位上哪个数字大。',
          `先比较十位的 ${Math.floor(a / 10)} 和 ${Math.floor(b / 10)}，${Math.max(a, b)} 大。`, undefined, [a, b]),
      ];
    },
    'g1-count-in-steps': round => {
      const [start, step] = pick([[12, 2], [20, 5], [30, 10], [32, 2]], round);
      return [
        number(`每次多 ${step}：${start}、${start + step}、${start + 2 * step}。接下来是几？`, start + 3 * step,
          `每一跳都是 ${step}。`, `${start + 2 * step} 再加 ${step}，到 ${start + 3 * step}。`),
        number(`每次数掉一组 ${step} 个：${start + 3 * step}、${start + 2 * step}、${start + step}。下一个是几？`, start,
          '找出最后一个数，再去掉一整组。', `${start + step} − ${step} = ${start}。`),
      ];
    },
    'g1-add-subtract-hundred': round => {
      const [start, add] = pick([[36, 8], [27, 6], [58, 7], [43, 9]], round);
      return [
        addition(start, add, '先把个位加到下一个整十，再接着加。'),
        number(`${start + add} − ${add} 等于多少？`, start, '先减到整十，再继续减没减完的部分。',
          `${start + add} 减 ${(start + add) % 10} 到 ${10 * Math.floor((start + add) / 10)}，再减 ${10 - start % 10} 得 ${start}。`),
      ];
    },
    'g1-story-problems': round => {
      const [first, second] = pick([[12, 5], [15, 8], [17, 6], [14, 9]], round);
      return [
        remaining(first, second),
        number(`墙上有 ${first} 张花画和 ${second} 张树画。花画比树画多几张？`, first - second,
          '给每张树画配一张花画，再看多出来的花画。', `用 ${first} 减去能配上的 ${second} 张，剩下 ${first - second} 张。`),
      ];
    },
    'bridge-story-unknown': round => {
      const [total, part] = pick([[12, 5], [11, 4], [13, 6], [15, 7]], round);
      return [
        number(`小鹿拿出 ${part} 张贴纸后，手上还有 ${total - part} 张。原来有多少张？`, total,
          '原来的贴纸包括拿出去的和手上剩下的。', `${part} + ${total - part} = ${total}，原来有 ${total} 张。`),
        number(`筐里原有 ${total} 个果子，送出一些后还剩 ${part} 个。送出多少个？`, total - part,
          '从原来的总数里减去留下的部分。', `${total} − ${part} = ${total - part}，就是送出去的果子数。`),
      ];
    },
    'g1-shape-groups': round => {
      const [a, b, c] = pick([['cube', 'cylinder', 'sphere'], ['cylinder', 'sphere', 'cube'], ['sphere', 'cube', 'cylinder']], round);
      const [property, solid, reason] = pick([
        ['有两个平平的圆面', '圆柱', '圆柱的两端都是圆面，侧面是弯的。'],
        ['没有平平的面', '球', '球表面到处都是弯的，找不到平面。'],
        ['每个面都是正方形', '正方体', '正方体的六个面都是一样大的正方形。'],
      ], round);
      const [rule, planar, candidates, match] = pick([
        ['有 4 条直边', ['square', 'triangle', 'rectangle'], ['正方形和长方形', '三角形和长方形', '正方形和三角形'], '正方形和长方形'],
        ['每条边都是直的', ['triangle', 'circle', 'rectangle'], ['圆形和长方形', '三角形和长方形', '圆形和三角形'], '三角形和长方形'],
        ['有 4 个角', ['circle', 'rectangle', 'square'], ['圆形和长方形', '圆形和正方形', '长方形和正方形'], '长方形和正方形'],
      ], round);
      return [
        q(`哪一个立体形状${property}？`, solid, '想象把每一个立体形状转一圈，看看各个面。',
          reason, { model: shapes(a, b, c), choices: ['球', '圆柱', '正方体'] }),
        q(`按「${rule}」分一组，哪两个图形能放在一起？`, match,
          '沿每个图形走一圈，只比较这条规则说的特征。', `${match}都符合「${rule}」这条规则。`,
          { model: shapes(...planar), choices: candidates }),
      ];
    },
    'g1-position-and-order': round => {
      const [row, position] = pick([[['square', 'circle', 'triangle', 'circle'], 2],
        [['circle', 'square', 'square', 'triangle'], 1], [['triangle', 'square', 'circle', 'square', 'triangle'], 3]], round);
      const answer = shapeNames[row[row.length - position]];
      return [
        q(`从右边开始数，第 ${position} 个是什么？`, answer, '先用手指出最右边的图形，从它数 1。',
          `右边第一个图形是${shapeNames[row.at(-1)]}，从右边数到第 ${position} 个是${answer}。`,
          { model: shapes(...row), choices: ['正方形', '三角形', '圆形'] }),
        number(`一排有 ${row.length} 盆花。左边第 ${position} 盆从右边数是第几盆？`, row.length - position + 1,
          '先从左边找到这一盆，再把最右边当第一盆重数。', `左边第 ${position} 盆的右边还有 ${row.length - position} 盆。从右数它是第 ${row.length - position + 1} 盆。`),
      ];
    },
    'g1-time-and-length': round => {
      const [hour, a, b] = pick([[2, 5, 3], [9, 4, 7], [4, 6, 2], [7, 3, 6]], round);
      return [hourQuestion(hour),
        number('积木一样长。两条彩带相差几块积木那么长？', Math.abs(a - b), '从同一端开始比，看一条超出几块。',
          `${Math.max(a, b)} 格减去 ${Math.min(a, b)} 格，相差 ${Math.abs(a - b)} 格。`,
          { kind: 'bars', items: [['绿', a], ['黄', b]] }),
      ];
    },
    'g1-make-a-tally': round => {
      const [row, circles, stars] = pick([
        ['星　圆　圆　星　圆　星', 3, 3], ['圆　圆　星　圆　圆', 4, 1],
        ['圆　星　圆　星　星', 2, 3], ['星　圆　星　星　星　圆', 2, 4],
      ], round);
      return [
        number('看一张记一笔。只在「圆点」那一行记了几笔？', circles, '看到星星卡时，圆点这一行不用记。',
          `圆点有 ${circles} 张，圆点这一行就记 ${circles} 笔。`, textModel(row)),
        number(`小禾记下圆点 ${circles} 笔和星星 ${stars} 笔。她一共翻开几张卡？`, circles + stars,
          '每张卡只在一行记了一笔。', `两行合起来有 ${circles + stars} 笔，所以一共翻开 ${circles + stars} 张卡。`),
      ];
    },
    'numbers-within-10000': round => {
      const [a, b] = pick([[6043, 6403], [5082, 5028], [7305, 7035], [2056, 2506]], round);
      return [
        number('按数位表写出这个数。', a, '从千位往个位看，空的数位用 0 占住。',
          `把四个数位依次写出来，得到 ${a}。`, place(a, ['千', '百', '十', '一']), [a, b, a + 1000]),
        number(`${a} 和 ${b}，哪个数大？`, Math.max(a, b),
          '从左往右比，找到第一处不同的数位。', `第一处不同的数位上，${Math.max(a, b)} 的数字更大。`,
          undefined, [a, b]),
      ];
    },
    'regroup-add-subtract': round => {
      const [a, b] = pick([[246, 127], [357, 124], [183, 249], [485, 138]], round);
      const total = a + b;
      return [
        addition(a, b, '先把个位相加，够 10 个一就换成 1 个十。'),
        number(`${total} − ${b} 等于多少？`, a, '个位不够减，就拆开 1 个十。',
          `把 ${total % 10} 个一和借来的 10 个一合起来，再减掉 ${b % 10} 个一，剩 ${a % 10} 个一。继续算十位和百位，得 ${a}。`,
          undefined, [a, a + 10, a - 10]),
      ];
    },
    'equal-groups-multiply': round => {
      const [groups, size] = pick([[3, 5], [4, 6], [2, 7], [5, 4]], round);
      const choices = [`${groups} × ${size}`, `${groups} + ${size}`, `${groups + 1} × ${size}`];
      return [
        equalGroups(groups, size),
        q('哪个算式能把这张图里的格子都数进去？', choices[0], '一排有几格？这样的排有几排？',
          `每排 ${size} 格，有 ${groups} 排。${groups} 个 ${size} 可以写成 ${choices[0]}。`,
          { model: grid(groups, size), choices }),
      ];
    },
    'share-and-group': round => {
      const [groups, size, left] = pick([[4, 3, 2], [5, 4, 1], [3, 6, 4], [6, 4, 3]], round);
      return [
        number(`把 ${groups * size} 张书签平均分给 ${groups} 人，每人几张？`, size,
          '一人一人轮着分，确保每个人得到一样多。', `${groups} 人，每人 ${size} 张，正好分完 ${groups * size} 张。`),
        division(groups, size, left),
      ];
    },
    'g2-two-five-ten-facts': round => {
      const [groups, size] = pick([[6, 2], [3, 5], [4, 10], [7, 2]], round);
      return [equalGroups(groups, size), division(groups, size)];
    },
    'g2-multiply-from-known-facts': round => {
      const [groups, size, known] = pick([[7, 6, 5], [8, 4, 5], [6, 7, 5], [8, 3, 4]], round);
      const extra = (groups - known) * size;
      const total = groups * size;
      return [
        number(`有 ${groups} 排花，每排 ${size} 朵。已经数出 ${known} 排有 ${known * size} 朵，还要加多少朵？`, extra,
          `还没有算的是 ${groups - known} 排，每排的数量一样。`,
          `${groups - known} 排，每排 ${size} 朵，要再加 ${extra} 朵。`, grid(groups, size),
          [extra, groups - known, total]),
        number(`知道 ${groups} 个 ${size} 合起来是 ${total}。把 ${total} 颗种子平均分给 ${groups} 人，每人几颗？`,
          size, '总数分成和乘法里一样多的组，找每组的数量。',
          `${groups} 组一共 ${total}，每组是 ${size}，所以每人得到 ${size} 颗。`),
      ];
    },
    'clock-coins': round => {
      const [hour, minute, yuan, jiao] = pick([[4, 20, 3, 7], [8, 35, 4, 6], [2, 15, 2, 8], [10, 45, 5, 3]], round);
      return [hourQuestion(hour, minute),
        number(`${yuan} 元 ${jiao} 角合起来是多少角？`, 10 * yuan + jiao, '把每一个 1 元都换成 10 角。',
          `${yuan} 元是 ${10 * yuan} 角，再加 ${jiao} 角，一共 ${10 * yuan + jiao} 角。`,
          undefined, [yuan + jiao, 10 * yuan + jiao, 10 * jiao + yuan]),
      ];
    },
    'measure-and-turn': round => {
      const [thing, unit, length] = pick([['蜡笔', '厘米', 8], ['走廊', '米', 15], ['橡皮', '厘米', 4], ['花坛小路', '米', 12]], round);
      const headings = ['↑', '→', '↓', '←'];
      const index = round % headings.length;
      return [
        q(`量${thing}的长度，最可能是 ${length} 什么？`, unit,
          '想一想一米有多长，再想想这样东西大约有多长。', `${thing}的长度用${unit}更合适，大约是 ${length} ${unit}。`,
          { choices: ['厘米', '米', '千米'] }),
        q('箭头顺时针转四分之一圈，转完指向哪里？', headings[(index + 1) % 4],
          '想象钟面上指针转过三大格。', `从 ${headings[index]} 向右转四分之一圈，到了 ${headings[(index + 1) % 4]}。`,
          { model: textModel(headings[index]), choices: headings }),
      ];
    },
    'g2-turn-and-reflect': round => {
      const headings = ['↑', '→', '↓', '←'];
      const index = round % headings.length;
      const [spot, reflection] = pick([['左边', '右边'], ['右边', '左边']], round);
      return [
        q('箭头顺时针转半圈后指向哪里？', headings[(index + 2) % 4], '把半圈想成连续转两个四分之一圈。',
          `半圈会让箭头指向相反方向，从 ${headings[index]} 到 ${headings[(index + 2) % 4]}。`,
          { model: textModel(headings[index]), choices: headings }),
        q(`镜线竖着画。叶子在镜线${spot}，它的镜像在哪边？`, reflection, '想想沿竖着的镜线对折会发生什么。',
          `对折时，叶子和镜像在镜线两侧相遇，所以镜像在${reflection}。`, { choices: ['左边', '右边', '镜线上'] }),
      ];
    },
    'g2-weigh-and-compare': round => {
      const [grams, unit, item, size] = pick([
        [950, '克', '一个梨', 180], [720, '千克', '一大袋花土', 8],
        [880, '克', '一块橡皮', 20], [660, '千克', '一袋大米', 5],
      ], round);
      return [
        number(`已经称出 ${grams} 克豆子。再加多少克，刚好是 1 千克？`, 1000 - grams,
          '先把 1 千克换成克，再找缺多少。',
          `1 千克是 1000 克。${grams} 克再加 ${1000 - grams} 克，刚好是 1000 克。`),
        q(`称${item}，记成「约 ${size} 什么」最合适？`, unit,
          '想一想这件东西拿起来多重，再选质量单位。', `${item}约重 ${size} ${unit}。`,
          { choices: ['克', '千克', '厘米'] }),
      ];
    },
    'sort-count-data': round => {
      const [a, b, c] = pick([[6, 2, 5], [7, 4, 5], [5, 3, 4], [4, 3, 5]], round);
      const words = pick([['树叶、树叶、石子、树叶、贝壳', 3], ['贝壳、树叶、石子、石子、树叶、树叶', 3],
        ['石子、树叶、贝壳、贝壳、树叶', 2], ['树叶、石子、树叶、树叶、贝壳、树叶', 4]], round);
      return [
        number('按物品名称分类，有几个是树叶？', words[1], '从第一项开始，每看到一个「树叶」记一次。',
          `只有「树叶」这一类要记，一共有 ${words[1]} 个。`, textModel(words[0])),
        bars(a, b, c),
      ];
    },
    'g2-survey-and-chart-key': round => {
      const [a, b, c, key] = pick([[5, 2, 3, 2], [4, 2, 3, 3], [6, 3, 5, 2], [6, 4, 5, 3]], round);
      return [
        bars(a, b, c, key),
        number(`每格代表 ${key} 票。果子这一栏有 ${c} 格，得了几票？`, c * key,
          `不是一格一票。每一格都要数 ${key} 票。`, `${c} 格，每格 ${key} 票，就是 ${c * key} 票。`,
          { kind: 'bars', items: [['叶子', a], ['花朵', b], ['果子', c]] }, [c, c + key, c * key]),
      ];
    },
    'g2-build-a-bar-chart': round => {
      const [category, count, fixed, other] = pick([['树屋', 6, 2, 4], ['池塘', 5, 1, 2], ['小桥', 7, 3, 3], ['花圃', 4, 0, 3]], round);
      return [
        q(`「${category}」得到 ${count} 票，每格代表 1 票。请在这一行填到 ${count} 格。`, count - fixed,
          '点到哪一格，就会把它和它左边的格一起填上。',
          `填到第 ${count} 格，条形长 ${count} 格，正好表示 ${count} 票。`,
          { build: { max: 8, fixed, token: 'bar', label: category } }),
        number(`「${category}」有 ${count} 票，「沙池」有 ${other} 票。都按一票一格画，「${category}」这一行多几格？`, count - other,
          '两行都从第 1 格开始，比较没对上的那几格。',
          `${category}有 ${count} 格，沙池有 ${other} 格，相差 ${count - other} 格。`),
      ];
    },
    'garden-story-models': round => {
      const [groups, size, more] = pick([[4, 5, 3], [3, 4, 4], [6, 2, 2], [4, 7, 5]], round);
      const total = groups * size;
      return [
        number(`一排种 ${size} 棵葱，一共 ${groups} 排。还有 ${more} 棵葱没种。一共有几棵葱？`, total + more,
          '先找出图里种下的数量，再加上没种的数量。', `${groups} 排有 ${total} 棵，再加 ${more} 棵，合起来是 ${total + more} 棵。`,
          grid(groups, size), [total, total + more, total + groups + more]),
        number(`第一筐摘了 ${total} 个果子，第二筐比第一筐少 ${more} 个。第二筐有几个？`, total - more,
          '把第一筐的数量分成第二筐的数量和多出来的部分。', `${total} − ${more} = ${total - more}，第二筐有 ${total - more} 个。`,
          { kind: 'tape', total, parts: [{ label: '?', size: total - more }, { label: more, size: more }] }),
      ];
    },
    'large-numbers': round => {
      const [value, after] = pick([[23478, 49999], [56619, 69999], [34052, 89999], [80349, 29999]], round);
      const lower = Math.floor(value / 100) * 100;
      const nearest = Math.round(value / 100) * 100;
      return [
        number(`${value} 更接近哪个整百数？`, nearest,
          `它在 ${lower} 和 ${lower + 100} 之间，比较到两端各差多少。`,
          `到 ${lower} 差 ${value - lower}，到 ${lower + 100} 差 ${lower + 100 - value}，所以更接近 ${nearest}。`,
          undefined, [lower, lower + 100]),
        number(`比 ${after} 多 1 的数是多少？`, after + 1, '个位满十向左进一，看看哪几位也会满十。',
          `进位一直传到万位，${after} 加 1 得 ${after + 1}。`),
      ];
    },
    'written-multiply': round => {
      const [a, b, c, d] = pick([[146, 3, 24, 13], [219, 4, 18, 16], [175, 6, 27, 12], [183, 5, 19, 14]], round);
      const tens = 10 * Math.floor(d / 10);
      const ones = d % 10;
      return [
        number(`${a} × ${b} 等于多少？`, a * b, '拆成百、十、个位分别乘，再合起来。',
          `把 ${a} 按数位拆开，三部分各乘 ${b} 后相加，结果是 ${a * b}。`, undefined, [a * b - 100, a * b, a * b + 10]),
        number(`${c} × ${d} 等于多少？`, c * d, `先乘 ${tens}，再乘 ${ones}，最后把两个结果加起来。`,
          `${c} × ${tens} = ${c * tens}，${c} × ${ones} = ${c * ones}，合起来是 ${c * d}。`,
          undefined, [c * d, c * ones + c * (tens / 10), c * d + c]),
      ];
    },
    'written-divide': round => {
      const [group, divisor, leftover] = pick([[105, 3, 2], [107, 4, 3], [102, 6, 1], [106, 5, 4]], round);
      const total = group * divisor + leftover;
      return [
        number(`${group * divisor} ÷ ${divisor} 的商是多少？`, group, '分到十位不够时，别忘记在十位记 0。',
          `先分百，再分一。商的百位是 1，十位是 0，个位是 ${group % 10}，所以商是 ${group}。`,
          undefined, [group, group % 100 + 10, group + 10]),
        number(`${total} ÷ ${divisor} 的余数是多少？`, leftover,
          `先想 ${divisor} 的倍数里，哪个最接近 ${total} 又没有超过它？`,
          `${divisor} × ${group} = ${group * divisor}，剩 ${leftover}，余数小于除数。`,
          undefined, near(leftover, 0, divisor)),
      ];
    },
    'g3-remainder-in-context': round => {
      const [groups, size, leftover] = pick([[4, 6, 3], [6, 4, 2], [5, 7, 1], [3, 8, 5]], round);
      const total = groups * size + leftover;
      return [
        number(`有 ${total} 株苗，每个盒子最多装 ${size} 株。要装下全部的苗，至少需要几个盒子？`, groups + 1,
          '想想每盒装满以后，余下的苗还需不需要一个盒子。',
          `${total} ÷ ${size} = ${groups} 余 ${leftover}。余下的 ${leftover} 株也要装，一共要 ${groups + 1} 盒。`),
        number(`有 ${total} 张纸，每 ${size} 张装一袋。尽量装满以后，没进袋的还剩几张？`, leftover,
          '这次求的是余下的张数，先算满袋装了多少。',
          `${groups} 个满袋装了 ${groups * size} 张，余下 ${leftover} 张。`),
      ];
    },
    'mixed-stories': round => {
      const [a, b, groups] = pick([[8, 3, 4], [7, 2, 5], [9, 4, 3], [6, 2, 7]], round);
      const expression = `${groups} × (${a} − ${b})`;
      return [
        q(`有 ${groups} 盘水果，每盘原来有 ${a} 个，都拿走 ${b} 个。哪个算式算剩下的总数？`, expression,
          '先算一盘里剩几个，再算几盘一共剩几个。', `用括号先算一盘，${expression} = ${(a - b) * groups}。`,
          { choices: [expression, `${groups} × ${a} − ${b}`, `${a} − ${groups} × ${b}`] }),
        number(`有 ${groups} 篮果子，每篮 ${a} 个。总共送出 ${b} 个后还剩几个？`, groups * a - b,
          '先算所有篮子里共有几个。这里送出的是总共几个。',
          `${groups} × ${a} = ${groups * a}，再减掉一共送出的 ${b} 个，剩 ${groups * a - b} 个。`,
          undefined, [groups * a - b, groups * (a - b), groups * a + b]),
      ];
    },
    'perimeter': round => {
      const [length, width] = pick([[6, 2], [7, 3], [5, 4], [8, 3]], round);
      return [
        number(`沿着长 ${length} 米、宽 ${width} 米的长方形花圃走一圈，一共走几米？`, 2 * (length + width),
          '一圈包含两条长边和两条短边。', `${length} + ${width} + ${length} + ${width} = ${2 * (length + width)} 米。`,
          grid(width, length, true), [length + width, 2 * (length + width), 4 * length]),
        number(`正方形菜地的周长是 ${4 * length} 米。每条边多长？`, length,
          '正方形四边等长，把周长平均分成四段。', `${4 * length} ÷ 4 = ${length} 米。`),
      ];
    },
    'area': round => {
      const [length, width] = pick([[6, 3], [5, 4], [7, 2], [8, 3]], round);
      return [
        number('每小格面积是 1 平方厘米。这个长方形的面积是多少平方厘米？', length * width,
          '数整个面里有几行，每行有几个格。', `每行 ${length} 格，共 ${width} 行。${length} × ${width} = ${length * width} 平方厘米。`,
          grid(width, length), [length + width, length * width, length * width + length]),
        number(`一块长方形贴纸面积是 ${length * width} 平方厘米。每行有 ${length} 个 1 平方厘米的格，一共有几行？`,
          width, '把全部小格按每行相同的数量分组。', `${length * width} ÷ ${length} = ${width} 行。`),
      ];
    },
    'first-fractions': round => {
      const [parts, first, second] = pick([[7, 2, 3], [5, 1, 3], [8, 2, 4], [6, 1, 2]], round);
      const answer = `${first + second}/${parts}`;
      return [
        q(`一张纸平均分成 ${parts} 份。先涂 ${first} 份，又涂另外 ${second} 份。一共涂了几分之几？`,
          answer, '每小份的大小没有变，只要把涂了的份数加起来。',
          `一共涂了 ${first + second} 个 ${parts} 分之一，就是 ${answer}。`,
          { model: { kind: 'fraction', parts, filled: first }, choices: [answer, `${first}/${parts}`, `${first + second}/${parts * 2}`] }),
        q(`两块一样大的饼。${parts} 等份的一份和 ${parts + 2} 等份的一份，哪一份更大？`, `1/${parts}`,
          '想一想，切的份数越多，每份会变大还是变小？', `分成 ${parts} 份比 ${parts + 2} 份少，取一份就更大。`,
          { choices: [`1/${parts}`, `1/${parts + 2}`, '一样大'] }),
      ];
    },
    'g3-fraction-positions': round => {
      const [parts, marked, other] = pick([[5, 2, 4], [4, 3, 1], [6, 4, 5], [7, 3, 2]], round);
      const bigger = Math.max(marked, other);
      const answer = `${marked}/${parts}`;
      const ticks = Array.from({ length: parts - 1 }, (_, index) => index + 1 === marked ? '●' : '┼');
      return [
        q(`把 0 到 1 的线段平均分成 ${parts} 段，从 0 开始走了 ${marked} 段。到哪个分数？`,
          answer, '先看整段被等分成多少份，再看走了几份。', `每一段是 ${parts} 分之一，走 ${marked} 段就是 ${answer}。`,
          { model: textModel(`0 ├──${ticks.join('──')}──┤ 1`), choices: [answer, `${marked + 1}/${parts}`, `${parts}/${marked}`] }),
        q(`数轴上的 ${marked}/${parts} 和 ${other}/${parts}，哪个离 0 更远？`, `${bigger}/${parts}`,
          '每次走的步子一样长，走的步数越多就越远。', `${bigger}/${parts} 从 0 走了 ${bigger} 小段，比走 ${Math.min(marked, other)} 小段远。`,
          { choices: [`${marked}/${parts}`, `${other}/${parts}`, '一样远'] }),
      ];
    },
    'first-decimals': round => {
      const [a, b] = pick([[38, 16], [42, 27], [54, 36], [63, 19]], round);
      const decimal = value => (value / 10).toFixed(1);
      return [
        q(`一根带子长 ${decimal(a)} 米，剪去 ${decimal(b)} 米，还剩多少米？`, decimal(a - b),
          '可以都换成分米，减完再换回米。', `${a} 分米减 ${b} 分米是 ${a - b} 分米，也就是 ${decimal(a - b)} 米。`,
          { choices: [decimal(a - b), decimal(a + b), decimal(a - b + 10)] }),
        q(`把 1 元分成 10 个 1 角。图里的涂色部分是多少元？`, decimal(b % 10),
          '涂色一格表示 1 角，就是 0.1 元。', `${b % 10} 角是 ${b % 10} 个十分之一元，写成 ${decimal(b % 10)} 元。`,
          { model: { kind: 'fraction', parts: 10, filled: b % 10 }, choices: [decimal(b % 10), '1.0', decimal(b)] }),
      ];
    },
    'g3-right-acute-obtuse': round => {
      const [opening, answer, object] = pick([['比直角张得大', '钝角', '剪刀'], ['比直角张得小', '锐角', '折扇'],
        ['和直角一样大', '直角', '纸盒的角']], round);
      const [prompt, changed, note] = pick([
        ['把一个角的两条边沿原来的方向延长，角的大小怎样变化？', '大小不变', '两条边只是变长，张口没有改变。'],
        ['把一张画着角的卡片转个方向，角的大小怎样变化？', '大小不变', '整个角跟着卡片一起转，两条边之间的张口一样大。'],
        ['保持折扇的一条边不动，把另一条边往里合。这个角的大小怎样变化？', '变小', '折扇合拢了一点，两条边之间的张口更小了。'],
      ], round);
      return [
        q(`${object}的开口${opening}，而且没有张成一条直线。这是什么角？`, answer,
          '把两个角的顶点和一条边对齐，再比另一条边张开多少。', `这个角${opening}，所以是${answer}。`,
          { choices: ['直角', '锐角', '钝角'] }),
        q(prompt, changed, '想想两条边之间张开的大小有没有改变。', note,
          { choices: ['变大', '变小', '大小不变'] }),
      ];
    },
    'g3-measure-intervals': round => {
      const [start, end, hour, minute, after] = pick([[3, 9, 4, 45, 12], [2, 7, 8, 50, 8],
        [5, 12, 6, 35, 13], [4, 10, 9, 40, 15]], round);
      const duration = 60 - minute + after;
      return [
        number(`铅笔一端对着尺子的 ${start} 厘米刻度，另一端对着 ${end} 厘米刻度。它长几厘米？`,
          end - start, '没从 0 开始量，数两端之间有几段 1 厘米。',
          `尺上的终点减起点，${end} − ${start} = ${end - start} 厘米。`),
        number(`从 ${hour}:${minute} 到 ${hour + 1}:${String(after).padStart(2, '0')} 一共过了几分钟？`,
          duration, '先数到下一个整点，再加整点之后的分钟。',
          `先过 ${60 - minute} 分钟到 ${hour + 1} 点整，再过 ${after} 分钟，共 ${duration} 分钟。`),
      ];
    },
    'g3-measure-capacity': round => {
      const [liters, milliliters, cup] = pick([[2, 1600, 250], [3, 2800, 200], [1, 750, 500], [2, 1500, 100]], round);
      return [
        number(`水壶能装 ${liters} 升，水瓶能装 ${milliliters} 毫升。水壶多装多少毫升？`, liters * 1000 - milliliters,
          '两种容量先换成同一种单位。',
          `${liters} 升是 ${liters * 1000} 毫升。${liters * 1000} − ${milliliters} = ${liters * 1000 - milliliters} 毫升。`,
          undefined, [liters * 1000 - milliliters, liters * 1000, milliliters]),
        number(`用 ${cup} 毫升的量杯装满 1 升水壶。每次都倒满杯，要倒几次？`, 1000 / cup,
          `把 1 升换成 1000 毫升，再看一共有几个 ${cup}。`,
          `1000 ÷ ${cup} = ${1000 / cup}，需要 ${1000 / cup} 满杯。`),
      ];
    },
    'garden-guide': round => {
      const [km, kg, start, end] = pick([[2, 3, 4, 9], [3, 2, 7, 10], [5, 4, 12, 16], [4, 2, 20, 26]], round);
      return [
        number(`从入口到温室有 ${km} 千米，合多少米？`, km * 1000, '1 千米就是 1000 米。',
          `${km} 个 1000 米，合 ${km * 1000} 米。`, undefined, [km * 100, km * 1000, km * 10000]),
        number(`花展在本月 ${start} 日开始、${end} 日结束。第一天和最后一天都开放，一共开放几天？`,
          end - start + 1, '从开始的日子起数 1，结束的那天也要数。', `${end} − ${start} = ${end - start}，再数上开始那天，共 ${end - start + 1} 天。`),
        number(`一个花盆重 ${kg} 千克，合多少克？`, kg * 1000, '1 千克是 1000 克。',
          `${kg} 个 1000 克，合 ${kg * 1000} 克。`, undefined, [kg * 100, kg * 1000, kg * 10000]),
      ];
    },
    'read-data': round => {
      const [a, b, c, key] = pick([[7, 3, 4, 2], [6, 2, 5, 4], [6, 3, 2, 3], [5, 3, 4, 4]], round);
      const answer = (a + c) * key;
      return [
        bars(a, b, c, key),
        number(`每格代表 ${key} 张票。叶子和果子的票合起来有几张？`, answer,
          '先把叶子和果子两条的格数合起来，再按图例换算。',
          `${a} 格加 ${c} 格是 ${a + c} 格，每格 ${key} 张，合起来 ${answer} 张。`,
          { kind: 'bars', items: [['叶子', a], ['花朵', b], ['果子', c]] }),
      ];
    },
  };
})();

function courseQuestionKey(question) {
  return JSON.stringify([question.prompt, question.model, question.build, question.line, question.bundles]);
}

function uniqueCourseQuestions(questions) {
  const seen = new Set();
  return questions.filter(question => {
    const key = courseQuestionKey(question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function courseVariantPool(lesson, round) {
  const generate = coursePracticeVariants[lesson.id];
  const extra = lesson.extraPractice ?? [];
  const start = round % Math.max(1, extra.length);
  const authored = [...extra.slice(start), ...extra.slice(0, start)];
  if (!generate) return authored;
  return [...authored, ...generate(round), ...generate(round + 1), ...generate(round + 2)];
}

function makeCoursePractice(lesson, attempt = 0) {
  if (attempt === 0) {
    return uniqueCourseQuestions([...lesson.practice, ...courseVariantPool(lesson, 0)]).slice(0, 5);
  }
  const anchor = lesson.practice.slice(attempt % lesson.practice.length, attempt % lesson.practice.length + 1);
  return uniqueCourseQuestions([...anchor, ...courseVariantPool(lesson, attempt), ...lesson.practice]).slice(0, 5);
}

function makeCourseReview(lesson, variant = 0, studyAttempt = 0) {
  const studied = new Set(makeCoursePractice(lesson, studyAttempt).map(courseQuestionKey));
  const pool = uniqueCourseQuestions([...courseVariantPool(lesson, variant + 1), ...lesson.practice]);
  const alternate = pool.filter(question => !studied.has(courseQuestionKey(question)));
  return uniqueCourseQuestions([...alternate, ...pool]).slice(0, 3);
}
