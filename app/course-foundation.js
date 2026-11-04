const foundation = {
  id: 'foundation', label: '零基础', title: '小小启蒙',
  description: '看一眼，点一朵，摆一摆。从身边的东西发现数量、形状和规律。',
  lessons: [
    {
      id: 'notice-small', title: '看见几朵花', goal: '从 1～3 朵开始，把花的数量和数字连起来。',
      example: { text: '这是一朵，那也是一朵。两朵在一起，用 2 表示。', model: { kind: 'dots', groups: [2] } },
      practice: [
        { prompt: '有几朵花？', model: { kind: 'dots', groups: [1], touch: true }, choices: [1, 2, 3], answer: 1, hint: '用手点一下这朵花。还有别的花吗？', explanation: '只看到一朵，所以是 1。' },
        { prompt: '有几朵花？', model: { kind: 'dots', groups: [3], touch: true }, choices: [1, 2, 3], answer: 3, hint: '从一边点到另一边，一朵花只点一次。', explanation: '一、二、三。最后数到 3，一共三朵。' },
        { prompt: '花分开了，一共有几朵？', model: { kind: 'dots', groups: [1, 1], touch: true }, choices: [1, 2, 3], answer: 2, hint: '上面那朵和下面那朵都要数。', explanation: '上面一朵，下面一朵，合起来还是两朵。' },
      ],
    },
    {
      id: 'count-total', title: '每朵只数一次', goal: '点数 1～5，理解最后一个数就是总数。',
      example: { text: '点一朵就数一个数。最后数到 4，花坛里一共有 4 朵。', model: { kind: 'dots', groups: [4] } },
      practice: [
        { prompt: '点一点，一共有几朵？', model: { kind: 'dots', groups: [5], touch: true }, choices: [3, 4, 5], answer: 5, hint: '已经点过的花会留下标记，看看还有哪朵没点。', explanation: '点过五朵不同的花，所以总数是 5。' },
        { prompt: '两排花一共有几朵？', model: { kind: 'dots', groups: [2, 2], touch: true }, choices: [2, 4, 5], answer: 4, hint: '数完第一排，接着数第二排。', explanation: '第一排两朵，第二排也两朵，一共四朵。' },
        { prompt: '花换了摆法，一共有几朵？', model: { kind: 'dots', groups: [2, 1, 2], touch: true }, choices: [4, 5, 6], answer: 5, hint: '每排都看一遍，从上到下点。', explanation: '两朵、一朵、再两朵，一共五朵。' },
      ],
    },
    {
      id: 'make-a-set', title: '照着数字摆花', goal: '从数字出发，亲手摆出相同数量。',
      example: { text: '看到 2，就在空花坛里放两朵。每点一个空格，放上一朵。', model: { kind: 'dots', groups: [2] } },
      practice: [
        { prompt: '放 3 朵花', build: { max: 5 }, answer: 3, hint: '一边点空格，一边数到三。', explanation: '三个花位都有花，所以放了三朵。' },
        { prompt: '放 5 朵花', build: { max: 5 }, answer: 5, hint: '看看还有没有空花位。', explanation: '五个花位都放上，正好五朵。' },
        { prompt: '放 2 朵花', build: { max: 5 }, answer: 2, hint: '数到二就停。点已放的花可以收回。', explanation: '只占两个花位，剩下的花位可以空着。' },
      ],
    },
    {
      id: 'none-and-more', title: '没有、更多、一样多', goal: '认识 0，用对应或点数来比较。',
      example: { text: '花坛一朵也没有，用 0 表示。两排花能一朵对一朵配完，就是一样多。', model: { kind: 'dots', groups: [0, 2] } },
      practice: [
        { prompt: '空花坛里有几朵？', model: { kind: 'dots', groups: [0] }, choices: [0, 1, 2], answer: 0, hint: '找一找，有任何一朵花吗？', explanation: '一朵也没有，就是 0。' },
        { prompt: '哪一排的花更多？', model: { kind: 'dots', groups: [2, 4] }, choices: ['上面', '下面', '一样多'], answer: '下面', hint: '上面每朵和下面的一朵配对，哪一排还剩花？', explanation: '下面四朵，上面两朵，下面更多。' },
        { prompt: '比一比，两排花怎样？', model: { kind: 'dots', groups: [3, 3] }, choices: ['上面更多', '下面更多', '一样多'], answer: '一样多', hint: '从左边开始一朵对一朵。', explanation: '两排都是三朵，正好配完，一样多。' },
      ],
    },
    {
      id: 'parts-and-whole', title: '两堆花合起来', goal: '通过合并和拿走，发现数量可以拆开、合回。',
      example: { text: '两朵和一朵放在一起，就有三朵。三朵也能拆成两朵和一朵。', model: { kind: 'dots', groups: [2, 1] } },
      practice: [
        { prompt: '两堆花放在一起，有几朵？', model: { kind: 'dots', groups: [2, 2], touch: true }, choices: [2, 3, 4], answer: 4, hint: '别只看一堆，把两堆的花都点一遍。', explanation: '两朵接着再数两朵，合起来是四朵。' },
        { prompt: '原来有 4 朵，拿走 1 朵，还剩几朵？', model: { kind: 'dots', groups: [4] }, choices: [2, 3, 5], answer: 3, hint: '用手遮住一朵，再数露在外面的。', explanation: '四朵拿走一朵，还能看见三朵。' },
        { prompt: '一堆有 3 朵，另一堆要放几朵，合起来才有 5 朵？', build: { max: 5 }, answer: 2, hint: '从三继续数，四、五。又数了几下？', explanation: '三朵再添两朵，就到了五朵。' },
      ],
    },
    {
      id: 'shape-sides', title: '跟图形做朋友', goal: '看边和角来认图形。',
      example: { text: '三角形有三条直边。转一个方向，也还是三角形。', model: { kind: 'shapes', items: ['triangle', 'square', 'circle'] } },
      practice: [
        { prompt: '三角形有几条直边？', model: { kind: 'shapes', items: ['triangle'] }, choices: [2, 3, 4], answer: 3, hint: '用手沿着图形边缘绕一圈。', explanation: '围成一圈的三条直边把三角形围起来。' },
        { prompt: '哪个图形没有角？', model: { kind: 'shapes', items: ['triangle', 'circle', 'square'] }, choices: ['三角形', '圆形', '正方形'], answer: '圆形', hint: '看看哪里有尖尖的转弯。', explanation: '圆形的边是弯弯的，没有角。' },
        { prompt: '正方形的四条边怎样？', model: { kind: 'shapes', items: ['square'] }, choices: ['都一样长', '只有两条边', '都是弯的'], answer: '都一样长', hint: '看看上、下、左、右这四条直边。', explanation: '正方形的四条边一样长，也有四个直角。' },
      ],
    },
    {
      id: 'repeat-unit', title: '找出重复的小组', goal: '从交替到三件一组，找到会反复出现的那一组。',
      example: { text: '圈、三角是一组。同一组接着来，下一组仍从圈开始。', model: { kind: 'shapes', items: ['circle', 'triangle', 'circle', 'triangle'] } },
      practice: [
        { prompt: '下一格放哪个？', model: { kind: 'shapes', items: ['circle', 'triangle', 'circle', 'triangle', 'circle'] }, choices: ['圆形', '三角形'], answer: '三角形', hint: '每个圆形的后面是什么？', explanation: '每组是圆形、三角形。最后一组还少一个三角形。' },
        { prompt: '下一格放哪个？', model: { kind: 'shapes', items: ['square', 'square', 'circle', 'square', 'square', 'circle', 'square'] }, choices: ['圆形', '正方形'], answer: '正方形', hint: '一组要先放两个正方形，再放一个圆形。', explanation: '新的一组刚放了一个正方形，再补一个正方形。' },
        { prompt: '「花、叶、叶」重复摆，每一组有几件？', choices: [2, 3, 4], answer: 3, hint: '只数会反复出现的那一小组。', explanation: '一朵花和两片叶，一组有三件。' },
      ],
    },
    {
      id: 'compare-measure-sort', title: '量一量，分一分', goal: '用同样大小的小格比较，用相同规则整理。',
      example: { text: '两条都从左边对齐。每格一样长，看看哪条用了更多格。', model: { kind: 'bars', items: [['甲', 3], ['乙', 5]] } },
      practice: [
        { prompt: '哪条用了更多格？', model: { kind: 'bars', items: [['甲', 5], ['乙', 2]] }, choices: ['甲', '乙', '一样多'], answer: '甲', hint: '从同一边开始，比谁伸得更远。', explanation: '甲有五格，乙有两格。格子一样长，甲更长。' },
        { prompt: '把圆形放一堆，一共有几个圆形？', model: { kind: 'shapes', items: ['circle', 'square', 'triangle', 'circle', 'circle'] }, choices: [2, 3, 4], answer: 3, hint: '只找边缘圆圆、没有角的图形。', explanation: '按是不是圆形来分，圆形一共有三个。' },
        { prompt: '哪个图标记录了 4 个？', model: { kind: 'bars', items: [['花', 2], ['叶', 4], ['果', 1]] }, choices: ['花', '叶', '果'], answer: '叶', hint: '一个小格代表一个，找一排四格。', explanation: '叶子这一排有四格，表示四片叶子。' },
      ],
    },
  ],
};
