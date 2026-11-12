const courseExtensions = [
  {
    stage: 'foundation', after: 'repeat-unit',
    lesson: {
      id: 'repair-a-pattern', title: '把花园规律修好', goal: '找出放错的一格，再按自己选的小组接着排。',
      example: { text: '约好每组是「圆、三角」。前面两组都对，最后的「圆、方」要把方换成三角。', model: { kind: 'shapes', items: ['circle', 'triangle', 'circle', 'triangle', 'circle', 'square'] } },
      practice: [
        { prompt: '约好按「圆、三角」反复排。第几格放错了？', answer: 4, choices: [2, 4, 6],
          model: { kind: 'shapes', items: ['circle', 'triangle', 'circle', 'square', 'circle', 'triangle'] },
          hint: '从左边把每两件看作一组，哪一组的第二件不对？', explanation: '第二组的第二件是第 4 格，应该是三角形。' },
        { prompt: '约好按「圆、圆、方」反复排。最后一格的三角形该换成什么？', answer: '正方形', choices: ['正方形', '圆形', '三角形'],
          model: { kind: 'shapes', items: ['circle', 'circle', 'square', 'circle', 'circle', 'triangle'] },
          hint: '每组三件，第三件都应该是什么？', explanation: '每组前两件是圆形，第三件是正方形。' },
        { prompt: '现在你选「圆、方、方」作一组。哪一条连续摆了两组？', answer: '○ □ □ ○ □ □', choices: ['○ □ □ ○ □ □', '○ □ ○ □ ○ □', '○ ○ □ ○ ○ □'],
          model: { kind: 'shapes', items: ['circle', 'square', 'square'] },
          hint: '读完前三个，再读后三个。两组都要和你选的一样。', explanation: '○ □ □ 接着 ○ □ □，同一组重复了两次。' },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-tens-and-ones',
    lesson: {
      id: 'g1-count-in-steps', title: '两个、五个、十个地数', goal: '用同样大的步子接着数，把一组当作一个计数单位。',
      example: { text: '每一篮放 5 个松果。从空篮开始，一篮一篮地数，松果总数是 0、5、10、15。每多一篮就多 5 个。', model: { kind: 'line', min: 0, max: 15, marks: [0, 5, 10, 15] } },
      practice: [
        { prompt: '每次多 2 个：2、4、6。请在数轴上点下一数。', answer: 8, line: { min: 0, max: 10, marks: [2, 4, 6] },
          hint: '从 6 向右走两小格。', explanation: '先到 7，再到 8，所以 6 的下一站是 8。' },
        { prompt: '花标每 5 张装一袋。已经有 15 张，再放一袋，总共有多少张？', answer: 20, choices: [16, 20, 25],
          hint: '多的是一袋，袋里有 5 张。', explanation: '15 再加一袋的 5 张，合起来 20 张。' },
        { prompt: '向后每次少 10：70、60、50，下一数是多少？', answer: 40, choices: [49, 45, 40],
          hint: '从 5 个十拿掉 1 个十。', explanation: '50 减 10 得 40，还剩 4 个十。' },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-shape-groups',
    lesson: {
      id: 'g1-position-and-order', title: '从哪边数，第几个？', goal: '说清楚从哪端开始，用左右和第几个描述位置。',
      example: { text: '从左往右数，圆形是第一个；从右往左数，正方形是第一个。同一排里的位置，得先说从哪边数。', model: { kind: 'shapes', items: ['circle', 'triangle', 'square'] } },
      practice: [
        { prompt: '从左往右数，第 2 个是什么？', answer: '三角形', choices: ['圆形', '三角形', '正方形'],
          model: { kind: 'shapes', items: ['circle', 'triangle', 'square', 'circle'] },
          hint: '先找到最左边的圆形，再往右移一个。', explanation: '第一个是圆形，紧挨着它的三角形是第二个。' },
        { prompt: '从右往左数，正方形排第几个？', answer: 2, choices: [1, 2, 3],
          model: { kind: 'shapes', items: ['triangle', 'square', 'circle'] },
          hint: '从右边的圆形开始，把圆形当作第一个。', explanation: '圆形第一，正方形第二。' },
        { prompt: '一排有 5 盆花。标着小叶子的花盆从左边数是第 4 盆，从右边数是第几盆？', answer: 2, choices: [1, 2, 4],
          model: { kind: 'text', text: '○　○　○　叶　○' },
          hint: '这次让最右边的一盆做第一盆。', explanation: '从右边开始数，先数一盆，接着就是标着小叶子的那盆，排第二。' },
      ],
    },
  },
  {
    stage: 'grade-2', after: 'share-and-group',
    lesson: {
      id: 'g2-two-five-ten-facts', title: '从 2、5、10 的乘法倒着想', goal: '用等组练习 2、5、10 的乘法，并用同一组数量关系做除法。',
      example: { text: '4 盘，每盘 5 颗，共 20 颗。同样的 20 颗，每盘 5 颗能装 4 盘；平均分到 4 盘，每盘是 5 颗。', model: { kind: 'grid', rows: 4, cols: 5, outline: true } },
      practice: [
        { prompt: '有 7 双手套，每双 2 只，一共有多少只手套？', answer: 14, choices: [9, 12, 14],
          hint: '每数到一双，就多 2 只。', explanation: '7 个 2 是 14，也就是 7 × 2 = 14。' },
        { prompt: '有 35 枚叶片贴纸，每 5 枚装一袋。哪道乘法能帮助算出袋数？', answer: '7 × 5 = 35', choices: ['7 × 5 = 35', '5 × 5 = 25', '5 × 2 = 10'],
          hint: '找几个 5 合起来正好是 35。', explanation: '7 个 5 是 35，所以 35 ÷ 5 = 7，正好装 7 袋。' },
        { prompt: '6 个盒子每盒放 10 张卡片。把全部卡片改成每袋 5 张，可以装几袋？', answer: 12,
          hint: '先算一共有几张。也可以想，一个 10 能分成几个 5？', explanation: '6 × 10 = 60，60 ÷ 5 = 12；每盒恰好可改装成两袋。' },
      ],
    },
  },
  {
    stage: 'grade-2', after: 'measure-and-turn',
    lesson: {
      id: 'g2-turn-and-reflect', title: '转一转，照照镜子', goal: '沿指定方向转动，分清旋转与沿镜线对折。',
      example: { text: '把朝上的箭头向右转四分之一圈，会变成朝右。照竖着的镜子时，左和右对换，上和下的位置保持对应。', model: { kind: 'text', text: '转动 ↑ →　　照镜子 ↖ │ ↗' } },
      practice: [
        { prompt: '箭头朝右。沿钟表指针转动的方向转四分之一圈，箭头改朝哪边？', answer: '↓', choices: ['↑', '↓', '←'],
          model: { kind: 'text', text: '起始方向　→' }, hint: '用手指向右，再按 3 到 6 的方向转。', explanation: '钟表上，3 在右边，6 在下边，箭头改朝下。' },
        { prompt: '看竖着的镜线。左边是朝左上方的箭头，右边镜中的箭头朝哪里？', answer: '↗', choices: ['↗', '↘', '↖'],
          model: { kind: 'text', text: '↖ │ ？' }, hint: '镜线两边的左右对换，朝上这一点不变。', explanation: '左上照镜子变成右上。' },
        { prompt: '下面哪一对箭头沿竖线对折时能重合？', answer: '↙ │ ↘', choices: ['↙ │ ↖', '↙ │ ↘', '↙ │ ↗'],
          hint: '找到和左边箭头一样朝下、但左右相反的那个。', explanation: '左下和右下互为镜像，沿中间的竖线对折可以重合。' },
      ],
    },
  },
  {
    stage: 'grade-2', after: 'sort-count-data',
    lesson: {
      id: 'g2-survey-and-chart-key', title: '先调查，再看图例', goal: '每份回答记一次，读图时按图例换算每格代表的数量。',
      example: { text: '每人只选一项想做的花园活动。把回答按项目分开记录。如果图例说一格代表 2 人，3 格就代表 6 人。', model: { kind: 'bars', items: [['浇花', 3], ['种花', 2]] } },
      practice: [
        { prompt: '调查大家最想种的花。哪种记录办法能保证每人只记一次？', answer: '每人选一种，记一笔', choices: ['每人选一种，记一笔', '最喜欢的花记两笔', '同一个人再答就再记'],
          hint: '想想每个人交的回答应该算几份。', explanation: '每个人选一种并且只记一笔，记录数才和回答人数相同。' },
        { prompt: '图例：每格代表 2 人。选择浇花的比选择种花的多几人？', answer: 4, choices: [2, 4, 10],
          model: { kind: 'bars', items: [['浇花', 5], ['种花', 3]] }, hint: '两条相差 2 格，每格代表 2 人。', explanation: '5 格减 3 格是 2 格，相差 2 × 2 = 4 人。' },
        { prompt: '图例：每格代表 5 张贴纸。两盒各有图中这么多，合起来有多少张？', answer: 25,
          model: { kind: 'bars', items: [['甲盒', 3], ['乙盒', 2]] }, hint: '先把两盒的格子数相加，再照图例换成张数。', explanation: '两盒一共 5 格，每格 5 张，所以是 25 张。' },
      ],
    },
  },
  {
    stage: 'grade-3', after: 'mixed-stories',
    lesson: {
      id: 'g3-right-acute-obtuse', title: '用一个直角去比', goal: '比较角的张口，分辨直角、锐角和钝角，再按角的特点分类。',
      example: { text: '书角可以当作直角来比较。张口比直角小的是锐角；比直角大、还没张到一条直线的是钝角。边画长一点，角的大小不变。', model: { kind: 'shapes', items: ['square'] } },
      practice: [
        { prompt: '钟面是 2 时整。两根针夹成的较小的角是什么角？', answer: '锐角', choices: ['锐角', '直角', '钝角'],
          model: { kind: 'clock', hour: 2, minute: 0 }, hint: '在钟面上，12 到 3 是一个直角。比一比 12 到 2 的张口。', explanation: '12 到 2 的张口比 12 到 3 小，是锐角。' },
        { prompt: '钟面是 4 时整。两根针夹成的较小的角是什么角？', answer: '钝角', choices: ['锐角', '直角', '钝角'],
          model: { kind: 'clock', hour: 4, minute: 0 }, hint: '和 12 到 3、12 到 6 的张口比较。', explanation: '12 到 4 的张口比直角大、比平角小，是钝角。' },
        { prompt: '想把正方形和长方形放在同一组。两种图形都符合哪一条？', answer: '都有四个直角', choices: ['都有四个直角', '一定四边同样长', '都只有三条边'],
          model: { kind: 'shapes', items: ['square', 'rectangle'] }, hint: '看看两个图形每个角的形状。', explanation: '正方形和长方形都有四个直角。长方形的四条边不一定一样长。' },
      ],
    },
  },
  {
    stage: 'grade-3', after: 'first-fractions',
    lesson: {
      id: 'g3-fraction-positions', title: '分数也有自己的位置', goal: '在 0 到 1 之间按等长小段找分数，用位置比较大小。',
      example: { text: '0 到 1 之间平均分成 4 小段，从 0 往右走 1 小段就是四分之一，再走一小段到四分之二。要数小段，不数刻度线。', model: { kind: 'text', text: '0 ├──┼──●──┼──┤ 1' } },
      practice: [
        { prompt: '0 到 1 平均分成 4 小段。● 在从 0 开始的第一个分点，表示哪个分数？', answer: '1/4', choices: ['1/3', '1/4', '4/1'],
          model: { kind: 'text', text: '0 ├──●──┼──┼──┤ 1' }, hint: '先看一共有几小段，再看走了几小段。', explanation: '一共 4 小段，走了 1 小段，位置就是四分之一。' },
        { prompt: '把同一个 0 到 1 的区间平均分成 5 小段。3/5 和 4/5，哪个在更右边？', answer: '4/5', choices: ['3/5', '4/5', '在同一个位置'],
          hint: '每一步一样长，从同一个 0 开始，谁多走了一步？', explanation: '4/5 表示走了 4 小段，比 3/5 多走一小段，所以 4/5 更靠右。' },
        { prompt: '在同一个 0 到 1 的区间里，从 0 往右走两等份中的一份，或走四等份中的两份，会到哪里？', answer: '同一个中点', choices: ['同一个中点', '走一份的更靠右', '走两份的更靠右'],
          hint: '想一想各自走到哪里，离 0 和 1 还有多远。', explanation: '1/2 和 2/4 都刚好走完整段的一半，都在中点。' },
      ],
    },
  },
  {
    stage: 'grade-3', after: 'garden-guide',
    lesson: {
      id: 'g3-measure-intervals', title: '从起点到终点有多远', goal: '用同一单位计算两刻度之间的长度，分段求跨整点的时长。',
      example: { text: '活动从 9 时 50 分到 10 时 15 分。先数到 10 时整，有 10 分钟；再数到 10 时 15 分，有 15 分钟，一共 25 分钟。', model: { kind: 'text', text: '9:50 → 10:00 → 10:15' } },
      practice: [
        { prompt: '用尺子量花签。左端在 2 厘米 3 毫米处，右端在 6 厘米 1 毫米处。花签有多少毫米长？', answer: 38,
          hint: '先把两端的刻度都换成毫米，再用右端减左端。', explanation: '两端刻度分别是 23 毫米和 61 毫米。61 − 23 = 38 毫米。' },
        { prompt: '给花浇水从 9 时 45 分到 10 时 20 分，一共用了多少分钟？', answer: 35,
          model: { kind: 'text', text: '9:45 → 10:00 → 10:20' }, hint: '拆成到 10 时整、过 10 时整两段。', explanation: '9 时 45 分到 10 时是 15 分钟，再过 20 分钟，共 35 分钟。' },
        { prompt: '11 时 40 分入园，计划逛 45 分钟，几点出园？', answer: '12 时 25 分', choices: ['12 时 15 分', '12 时 25 分', '12 时 45 分'],
          hint: '先用 20 分钟走到 12 时，计划还剩多少分钟？', explanation: '45 分钟里先用 20 分钟到 12 时整，再过 25 分钟，是 12 时 25 分。' },
      ],
    },
  },
];
