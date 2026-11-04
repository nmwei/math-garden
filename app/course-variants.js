function makeReviewPractice(lessonId, variant) {
  const pick = cases => cases[variant % cases.length];
  const question = (prompt, answer, hint, explanation, fields = {}) =>
    ({ prompt, answer, hint, explanation, ...fields });
  const dots = (...groups) => ({ kind: 'dots', groups, touch: true });
  const choicesNear = (answer, max = Infinity) => {
    const start = Math.max(0, Math.min(answer - 1, max - 2));
    return [start, start + 1, start + 2];
  };
  const count = (groups, prompt = '从任意一朵开始，点完后说说一共有几朵。') => {
    const total = groups.reduce((sum, size) => sum + size, 0);
    return question(prompt, total, '每朵只点一次。最后数到的那个数，就是总数。',
      `最后数到 ${total}，总数就是 ${total} 朵。`, { model: dots(...groups), choices: choicesNear(total, 5) });
  };
  const plant = (target, prompt) =>
    question(prompt, target, `每点一个空位就放一朵。数到 ${target} 就停。`,
      `放了 ${target} 朵花，正好和要求的数量一样。`, { build: { max: 5 } });
  const fill = (target, fixed) =>
    question(`要种满 ${target} 朵，已有 ${fixed} 朵。还要放几朵？`, target - fixed,
      '只给空格放花，原来已经种好的花不用再放。', `${fixed} 加 ${target - fixed} 正好是 ${target}。`,
      { build: { max: target, fixed, frame: target === 10 } });
  const missing = (total, visible) =>
    question(`两袋一共有 ${total} 颗种子。这袋有 ${visible} 颗，另一袋有几颗？`, total - visible,
      `把 ${visible} 和另一袋合起来，应当正好得到 ${total}。`,
      `${visible} ＋ ${total - visible} ＝ ${total}，所以另一袋有 ${total - visible} 颗。`,
      { choices: choicesNear(total - visible, 10) });
  const walk = (start, offset) => {
    const direction = offset > 0 ? '往数变大的方向' : '往数变小的方向';
    const steps = Math.abs(offset);
    const end = start + offset;
    return question(`从 ${start} 出发，${direction}数 ${steps} 格，点停下来的位置。`, end,
      `从 ${start} 的下一格开始数，起点不算一步。`,
      `从 ${start} ${direction}数 ${steps} 格，停在 ${end}。`,
      { line: { min: start - 3, max: start + 3, marks: [start] } });
  };
  const crossAdd = (base, add) => {
    const toTen = 10 - base;
    const rest = add - toTen;
    return question(`原有 ${base} 朵花，又放来 ${add} 朵，一共几朵？`, base + add,
      `看十格里还差多少。先从新增的 ${add} 朵里拿够填满十格。`,
      `${add} 可以分成 ${toTen} 和 ${rest}。先凑成 10，再加 ${rest}，得到 ${base + add}。`,
      { model: { kind: 'frame', filled: base }, choices: choicesNear(base + add, 20) });
  };

  switch (lessonId) {
    case 'count-total': {
      const [first, second] = pick([[[2, 1], [3, 2]], [[1, 2, 1], [3, 1, 1]], [[1, 3], [2, 3]]]);
      const total = first.reduce((sum, size) => sum + size, 0);
      return [
        count(first, '小花藏在几排里，一共有几朵？'),
        count([total - 1, 1], `刚才有 ${total} 朵，只挪了位置。现在一共有几朵？`),
        count(second, '先点下面，再点上面。一共点了几朵不同的花？'),
      ];
    }
    case 'make-a-set': {
      const [first, second, third] = pick([[1, 3, 4], [4, 1, 3], [5, 2, 4]]);
      return [
        plant(first, `看数字牌 ${first}，种下同样多的花。`),
        plant(second, `请给小兔种 ${second} 朵花，种好就停。`),
        plant(third, `花架有空位，只要放 ${third} 朵。请摆出来。`),
      ];
    }
    case 'bridge-quantity-to-ten': {
      const targets = pick([[7, 9, 8], [9, 7, 6], [8, 6, 7]]);
      return targets.map((target, index) => question(
        ['在花圃里留出空位，种下', '这张数字牌需要', '换个摆法，再种'][index] + ` ${target} 朵花。`,
        target, '上面一排可以摆五朵。五以后接着数。',
        `五朵和 ${target - 5} 朵合起来是 ${target} 朵，换摆法后总数一样。`,
        { build: { max: 10, frame: true } },
      ));
    }
    case 'none-and-more': {
      const [top, bottom, equal] = pick([[1, 3, 4], [5, 3, 2], [4, 2, 5]]);
      const fewer = top < bottom ? '上面' : '下面';
      return [
        question('上面的花坛没有花。用哪个数字记下来？', 0,
          '看上面一排，下面的花先不数。', '上面一朵也没有，用 0 表示。',
          { model: dots(0, equal), choices: [0, 1, 2] }),
        question('哪一排的花更少？', fewer, '从一端开始，试着上下一一配对。',
          `上面 ${top} 朵，下面 ${bottom} 朵，${fewer}的花更少。`,
          { model: dots(top, bottom), choices: ['上面', '下面', '一样多'] }),
        question('每排取一朵配在一起，最后会怎样？', '正好配完',
          '数数每排的花，看看两边能不能一一配对。', `两排各有 ${equal} 朵，正好配完。`,
          { model: dots(equal, equal), choices: ['正好配完', '上面有剩', '下面有剩'] }),
      ];
    }
    case 'g1-make-five-ten': {
      const [small, large, shown] = pick([[3, 8, 4], [4, 5, 8], [1, 7, 5]]);
      return [fill(5, small), fill(10, large), missing(10, shown)];
    }
    case 'g1-add-subtract-ten': {
      const [left, right, start, taken, total, shown] = pick([
        [1, 7, 7, 4, 9, 6], [2, 6, 10, 3, 7, 2], [4, 5, 8, 5, 6, 2],
      ]);
      return [
        question(`两只花篮分别有 ${left} 朵和 ${right} 朵。都倒进同一篮，会有几朵？`, left + right,
          '两个花篮的花都留下，要把两组合起来。', `${left} ＋ ${right} ＝ ${left + right}。`,
          { model: dots(left, right), choices: choicesNear(left + right, 10) }),
        question(`共有 ${start} 朵花，送出 ${taken} 朵，还剩多少朵？`, start - taken,
          `从 ${start} 往数变小的方向数 ${taken} 格。起点不算一步。`,
          `${start} − ${taken} ＝ ${start - taken}。`,
          { model: { kind: 'line', min: 0, max: 10, marks: [start] }, choices: choicesNear(start - taken, 10) }),
        missing(total, shown),
      ];
    }
    case 'bridge-missing-part': {
      const [fixed, total, shown, greater, fewer] = pick([[7, 9, 5, 8, 5], [6, 8, 5, 9, 4], [8, 7, 4, 10, 6]]);
      return [
        fill(10, fixed),
        missing(total, shown),
        question(`小禾有 ${greater} 片叶子，小雨有 ${fewer} 片。小禾多几片？`, greater - fewer,
          '给两人的叶子一一配对。多出来的那些就是相差的数量。',
          `${greater} − ${fewer} ＝ ${greater - fewer}，小禾多 ${greater - fewer} 片。`,
          { model: dots(greater, fewer), choices: choicesNear(greater - fewer, 10) }),
      ];
    }
    case 'bridge-count-flex': {
      const [forward, backward, gap] = pick([[27, 41, 19], [39, 31, 60], [58, 70, 90], [68, 51, 40]]);
      return [
        walk(forward, 2),
        walk(backward, -3),
        question(`点出 ${gap - 1} 和 ${gap + 1} 之间缺的数。`, gap,
          `从 ${gap - 1} 往数变大的方向走一格。起点不算一步。`,
          `${gap - 1} 再多一是 ${gap}，再多一才到 ${gap + 1}。`,
          { line: { min: gap - 3, max: gap + 3, marks: [gap - 1, gap + 1] } }),
      ];
    }
    case 'bridge-bundle-ten': {
      const [ones, tens, loose] = pick([[34, 4, 2], [27, 3, 2], [38, 4, 6], [45, 2, 6]]);
      const bundles = Math.floor(ones / 10);
      const left = ones % 10;
      const label = (groups, rest) => `${groups} 捆和 ${rest} 根`;
      const answer = label(bundles, left);
      return [
        question(`把 ${ones} 根小棒每 10 根捆一捆，能捆的都捆好。最后有几捆和几根？`, answer,
          '散棒还有 10 根或更多，就能再捆一捆。',
          `${ones} 根能捆成 ${bundles} 捆，剩下 ${left} 根散棒。`,
          { bundles: { ones }, choices: [label(bundles - 1, left), answer, label(bundles, left - 1)] }),
        question(`${tens} 个十和 ${loose} 个一，合起来是多少？`, tens * 10 + loose,
          '一捆是 10 个。先数几捆有多少，再加散的。',
          `${tens} 个十是 ${tens * 10}，加上 ${loose} 得到 ${tens * 10 + loose}。`,
          { choices: [tens + loose, loose * 10 + tens, tens * 10 + loose] }),
        question(`桌上有 ${tens} 捆和 9 根小棒，再添 1 根，一共有多少根？`, (tens + 1) * 10,
          '9 根再添 1 根，刚好能加一捆。', `散的正好又捆出一捆。现在有 ${tens + 1} 捆，一共 ${(tens + 1) * 10} 根。`,
          { choices: [tens * 10, tens * 10 + 9, (tens + 1) * 10] }),
      ];
    }
    case 'bridge-cross-ten': {
      const [base, added, start, taken, secondBase, secondAdded] = pick([
        [8, 6, 14, 7, 9, 4], [6, 7, 12, 5, 8, 8], [9, 8, 15, 8, 7, 5], [6, 8, 13, 7, 9, 5],
      ]);
      const toTen = start - 10;
      const rest = taken - toTen;
      return [
        crossAdd(base, added),
        question(`桌上有 ${start} 颗种子，拿走 ${taken} 颗。还剩几颗？`, start - taken,
          `先拿走 ${toTen} 颗回到 10，看看还要拿走几颗。`,
          `还要拿走 ${rest} 颗，10 − ${rest} ＝ ${start - taken}。`,
          { model: { kind: 'line', min: 5, max: 15, marks: [start] }, choices: choicesNear(start - taken, 10) }),
        crossAdd(secondBase, secondAdded),
      ];
    }
    default:
      return null;
  }
}
