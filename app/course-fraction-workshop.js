const courseFractionWorkshop = (() => {
  function fractionStrip(parts, filled) {
    return { kind: 'fraction', parts, filled };
  }

  function stripMarks(parts, markCount = false) {
    return {
      kind: 'strip',
      labels: Array.from({ length: parts }, (_, index) => `第 ${index + 1} 格`),
      markCount,
    };
  }

  function shadeAndRead({ material, parts, filled }) {
    const fraction = `${filled}/${parts}`;
    const unshaded = parts - filled;
    const reason = '每格一样大，分母数全部格，分子数选中的格';
    return {
      context: `做一张${material}。把整张分成 ${parts} 个一样大的格，用其中 ${filled} 格做图案。看看这个图案占整张的几分之几。`,
      steps: [
        {
          prompt: `点亮任意 ${filled} 格作为图案。`,
          marks: stripMarks(parts, true),
          answer: filled,
          hint: '每个格一样大。点亮一格算一份，再数数已经点了几份。',
          explanation: `整张有 ${parts} 份，你取了其中 ${filled} 份。`,
        },
        {
          prompt: '用哪个分数来记图案占整张的多少？',
          choices: [`${unshaded}/${parts}`, fraction, `${parts}/${filled}`],
          answer: fraction,
          model: fractionStrip(parts, filled),
          hint: '写在下面的是整张的总份数，写在上面的是取出的份数。',
          explanation: `整张被平均分成 ${parts} 份，图案占其中 ${filled} 份，写成 ${fraction}。图里把涂色格摆在了一起，换位置也一样多。`,
        },
        {
          prompt: '这张图为什么能用这个分数表示？',
          choices: ['只要格数相同，格子大小不同也可以', '分母数没涂的格，分子数涂了的格', reason],
          answer: reason,
          hint: '要先确认每格是不是一样大，再想两个数各数的是什么。',
          explanation: '每一份必须一样大。数出总份数和选中的份数，就能说明它占整个多少。',
        },
      ],
      explain: '可以指着图说给家人听。整张分了几份？取了几份？如果把涂色移到别处，分数会变吗？',
      reflection: `整张平均分成 ${parts} 份，我涂了 ${filled} 份，所以是 ${fraction}。涂色换到别的格子，格子的大小和涂过的份数都一样，分数也一样。`,
    };
  }

  function stripToLine({ material, parts, filled }) {
    const fraction = `${filled}/${parts}`;
    const reason = '从 0 到 1 数的是等长小段，刻度线只是小段的边界';
    return {
      context: `用整条${material}当作长度 1。图里从左端涂起，每格一样长。把涂色的长度搬到 0 到 1 的数轴上。`,
      steps: [
        {
          prompt: '在数轴上点出涂色结束的位置。',
          model: fractionStrip(parts, filled),
          fractionLine: { parts },
          answer: filled,
          hint: '纸条左端对齐 0，整条右端对齐 1。先数涂色小段，再从 0 往右走同样多段。',
          explanation: `从 0 往右走 ${filled} 个小段，正好到涂色部分的右端。`,
        },
        {
          prompt: '给刚才标出的位置选一张分数卡。',
          model: fractionStrip(parts, filled),
          choices: [`${filled}/${parts + 1}`, `${filled + 1}/${parts}`, fraction],
          answer: fraction,
          hint: '下面写 0 到 1 的总段数，上面写从 0 走了几段。',
          explanation: `0 到 1 平均分成 ${parts} 小段，从 0 走了 ${filled} 段，点就在 ${fraction}。`,
        },
        {
          prompt: `为什么看见 ${parts + 1} 条刻度线，分母还是 ${parts}？`,
          choices: [reason, '0 不算一个数，所以要去掉 0', '数轴每次都比纸条少一格'],
          answer: reason,
          hint: '试着用手指跨过相邻两条线。跨过去的是一个小段。',
          explanation: `${parts + 1} 条线把 0 到 1 分成 ${parts} 段。分数的单位来自段长。`,
        },
      ],
      explain: '拿纸画一条从 0 到 1 的线，再画一条一样长的纸带。指给家人看，涂色的末端和数轴上的点怎样对应。',
      reflection: `纸带的左端对齐 0，右端对齐 1。纸带的一格对应数轴上的一小段。涂色有 ${filled} 格，所以从 0 走 ${filled} 段，正好到 ${fraction}。`,
    };
  }

  function lineUpStrips({ material, parts, filled }) {
    const extraParts = parts * 2;
    const extraFilled = filled * 2;
    const fraction = `${filled}/${parts}`;
    const matching = `${extraFilled}/${extraParts}`;
    const comparison = extraFilled === parts ? '正好一半' : extraFilled > parts ? '多于一半' : '少于一半';
    const reason = '从同一个 0 出发，两个分数到达同一个位置';
    return {
      context: `两条${material}一样长。上面一条分成 ${parts} 个一样长的格，从左端涂了 ${filled} 格。下面一条分成 ${extraParts} 个一样长的格。用下面的纸条涂出相同的长度。`,
      steps: [
        {
          prompt: '从左往右连续点亮下面的格子，让涂色的右端对齐上面的纸条。',
          model: fractionStrip(parts, filled),
          marks: stripMarks(extraParts),
          answer: Array.from({ length: extraFilled }, (_, index) => index),
          hint: '两条纸带一样长。试试上面一格的宽度，能盖住下面几格。',
          explanation: `上面的一格正好对应下面的两格。${filled} 个大格和 ${extraFilled} 个小格的涂色长度相同。`,
        },
        {
          prompt: '把第二条纸带的涂色右端标到数轴上。',
          model: fractionStrip(extraParts, extraFilled),
          fractionLine: { parts: extraParts },
          answer: extraFilled,
          hint: '从 0 开始，每走一小段就对应下方纸带的一格。',
          explanation: `从 0 走 ${extraFilled} 小段，标出的是 ${matching}，与第一条纸带的涂色右端在同一位置。`,
        },
        {
          prompt: '对照整条纸带的中点，涂色的长度和一半比怎样？',
          model: fractionStrip(extraParts, extraFilled),
          choices: ['少于一半', '正好一半', '多于一半'],
          answer: comparison,
          hint: `下方纸带一共有 ${extraParts} 格。从左数 ${parts} 格正好到中点。`,
          explanation: `从左涂 ${extraFilled} 格，一半是 ${parts} 格，所以是${comparison}。`,
        },
        {
          prompt: `为什么 ${fraction} 和 ${matching} 表示同一个数？`,
          choices: ['分子越大，长度总是越长', reason, '分母相同的分数才可能一样大'],
          answer: reason,
          hint: '比较这两个涂色部分的终点，想一想小段变多时，每一小段的长度怎么变了。',
          explanation: `等长的整体分得更细，每小份更短。${fraction} 和 ${matching} 走的份数不同，但离 0 一样远。`,
        },
      ],
      explain: '把两条一样长的纸条贴在一起，从左边对齐。说说每份变短时，为什么能用更多的小格表示同样长的一段。',
      reflection: `上面一格和下面两格一样长。上面的 ${filled} 格和下面的 ${extraFilled} 格从同一个位置开始，右端正好对齐。所以 ${fraction} 和 ${matching} 表示同一个数。`,
    };
  }

  return [
    {
      id: 'fraction-shading',
      title: '给花园小卡涂色',
      description: '动手涂出同样大小的格，再用分数记下取了多少。',
      lessonId: 'first-fractions',
      variants: [
        { material: '种植标签', parts: 5, filled: 2 },
        { material: '花园请柬', parts: 4, filled: 3 },
        { material: '活动书签', parts: 6, filled: 4 },
      ].map(shadeAndRead),
    },
    {
      id: 'fraction-strip-line',
      title: '把纸带搬到数轴',
      description: '用同一个 0 和 1，把纸带的长度变成数轴上的点。',
      lessonId: 'g3-fraction-positions',
      variants: [
        { material: '活动纸带', parts: 4, filled: 3 },
        { material: '布带', parts: 6, filled: 2 },
        { material: '细纸条', parts: 5, filled: 3 },
      ].map(stripToLine),
    },
    {
      id: 'fraction-same-length',
      title: '换个分法，还是一样长',
      description: '对齐两条同样长的纸带，认识等值分数，再用一半作比较。',
      lessonId: 'g3-fraction-positions',
      variants: [
        { material: '纸带', parts: 2, filled: 1 },
        { material: '彩纸条', parts: 3, filled: 2 },
        { material: '标签纸带', parts: 3, filled: 1 },
      ].map(lineUpStrips),
    },
  ];
})();
