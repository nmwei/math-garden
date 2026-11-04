const bridgeLessons = [
  {
    stage: 'foundation', after: 'make-a-set',
    lesson: {
      id: 'bridge-quantity-to-ten', title: '把 6 到 9 朵花摆出来',
      goal: '从数字取出指定数量，摆满上排五格后接着数。',
      homeTip: '把 7 枚扣子从一排挪成两排，再数数是不是还一样多。',
      example: {
        text: '摆 6 朵时，先在上排摆 5 朵，再在下面摆 1 朵。换个位置，花还是这么多。',
        model: { kind: 'frame', filled: 6 },
      },
      practice: [
        { prompt: '看着数字牌，在十格花坛里种 6 朵。', build: { max: 10, frame: true }, answer: 6,
          hint: '先摆满上排五格，再添一朵。', explanation: '5 朵和 1 朵合起来正好是 6。' },
        { prompt: '小兔要 8 朵花，请在十格里摆出来。', build: { max: 10, frame: true }, answer: 8,
          hint: '数到五以后，接着数六、七、八。', explanation: '上面摆五朵，下面再摆三朵，一共八朵。' },
        { prompt: '不用按原来的位置摆，试试种出 9 朵花。', build: { max: 10, frame: true }, answer: 9,
          hint: '十格少摆一格，就会有九朵。', explanation: '十个花位空一个，就有九个花位有花。' },
      ],
    },
  },
  {
    stage: 'foundation', after: 'count-total',
    lesson: {
      id: 'bridge-same-amount', title: '换个摆法，还是这么多',
      goal: '知道摆得开或挤在一起，不会改变物件总数。',
      example: {
        text: '四朵花摆成一排。把其中两朵搬到下一排，花的位置变了，一朵也没多，一朵也没少，还是四朵。',
        model: { kind: 'dots', groups: [2, 2] },
      },
      practice: [
        {
          prompt: '原来五朵花排成一排。现在把同一批花摆成两排。一共有几朵？',
          model: { kind: 'dots', groups: [3, 2], touch: true }, answer: 5, choices: [3, 5, 6],
          hint: '花换了地方。想想有没有添花，或者拿走花。',
          explanation: '只换位置，总数不变。分两排数，三朵和两朵合起来还是五朵。',
        },
        {
          prompt: '盘里有四片叶子。把它们推得更近，一片也没拿走。现在有几片？',
          answer: 4, choices: [3, 4, 5],
          hint: '先想一想，叶子挪了位置，还是有叶子离开了盘子？',
          explanation: '四片叶子还都在盘里，挤在一起也还是四片。',
        },
        {
          prompt: '花坛里原来有四朵花。换了摆法以后，又添了一朵。现在有几朵？',
          answer: 5, choices: [3, 4, 5],
          hint: '只换摆法时还是四朵。后来还做了什么？',
          explanation: '换摆法没有改变数量。添了一朵，才从四朵变成五朵。',
        },
      ],
    },
  },
  {
    stage: 'foundation', after: 'none-and-more',
    lesson: {
      id: 'bridge-match-pairs', title: '一个花盆配一朵花',
      goal: '用一一配对找出哪一边有剩、哪一边还差。',
      example: {
        text: '两朵花想住进三个花盆。一个盆只住一朵，配完以后会空着一个盆。',
        model: { kind: 'bars', items: [['花', 2], ['花位', 3]] },
      },
      practice: [
        {
          prompt: '上排是花，下排是空花位。一个花位放一朵。放完后，哪边有剩？',
          model: { kind: 'bars', items: [['花', 3], ['花位', 4]] }, answer: '空花位', choices: ['花', '空花位', '都没有剩'],
          hint: '从左边开始，上下一对一地配。哪一排还有没配到的？',
          explanation: '三朵花配三个花位，下排还有一个空花位。',
        },
        {
          prompt: '四个孩子每人要一把小铲子。桌上只有两把，还需要几把？',
          answer: 2, choices: [1, 2, 4],
          hint: '把两把铲子先分给两个人。还有几个人没有？',
          explanation: '两个人已经有了，另两个人还没有，所以还要两把。',
        },
        {
          prompt: '三顶帽子配三个孩子，每个孩子戴一顶。两个孩子把帽子换着戴，还要再拿帽子吗？',
          answer: '不用', choices: ['再拿一顶', '不用', '再拿两顶'],
          hint: '帽子换了主人。帽子的数量有改变吗？',
          explanation: '只是交换帽子，仍是三顶帽子给三个孩子，每人一顶。',
        },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-numbers-to-ten',
    lesson: {
      id: 'bridge-count-flex', title: '从任意一个数开始走',
      goal: '从给定的数开始接着数，知道前一个和后一个差 1。',
      example: {
        text: '先站在 6。往右一步到 7，往左一步到 5。每跨过相邻的两道刻度，就是走了一步。',
        model: { kind: 'line', min: 3, max: 9, marks: [6] },
      },
      practice: [
        {
          prompt: '从 5 往右走一步。点出到达的数。',
          line: { min: 2, max: 8, marks: [5] }, answer: 6,
          hint: '先找到 5，再选它右边紧挨着的刻度。',
          explanation: '5 的后一个数是 6。走一步只跨到下一条刻度。',
        },
        {
          prompt: '从 10 往左走两步。点出到达的数。',
          line: { min: 6, max: 12, marks: [10] }, answer: 8,
          hint: '出发的 10 不算一步。先到 9，再往左走一步。',
          explanation: '10 往左一步是 9，两步是 8。',
        },
        {
          prompt: '种子袋排号是 8、9、□、11。空格里要写哪个数？',
          answer: 10, choices: [7, 10, 12],
          hint: '找 9 的后一个数，也可以想 11 的前一个数。',
          explanation: '9 后面是 10，10 后面是 11，所以空格里写 10。',
        },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-add-subtract-ten',
    lesson: {
      id: 'bridge-missing-part', title: '找回缺的一部分',
      homeTip: '用杯子扣住 10 颗豆子中的几颗，数数露出的豆子，猜猜杯子里有几颗。',
      goal: '知道总数和其中一部分时，用加法或减法找出另一部分。',
      example: {
        text: '两篮一共有八个松果，第一篮有六个。把六个从总数八个里去掉，剩下两个是第二篮的。可以用 8 − 6 = 2 来找，再用 6 + 2 = 8 检查。',
        model: { kind: 'tape', total: 8, parts: [{ size: 6, label: '6' }, { size: 2, label: '2' }] },
      },
      practice: [
        {
          prompt: '已经放了 7 朵。只添几朵，就正好放满十格？试着填上空格。',
          build: { max: 10, fixed: 7, frame: true }, answer: 3,
          hint: '只填空着的格子。已经有的花不算新添的。',
          explanation: '空着三格。新添三朵后，7 + 3 = 10。',
        },
        {
          prompt: '盒里有 9 枝笔，送出一些后剩 5 枝。送出了几枝？',
          answer: 4, choices: [4, 5, 9],
          model: { kind: 'tape', total: 9, parts: [{ size: 5, label: '留下 5' }, { size: 4, label: '?' }] },
          hint: '9 是原来的全部，5 是留下的一部分。另一部分在哪里？',
          explanation: '用 9 − 5 = 4 找到送出的四枝，再用 5 + 4 = 9 检查。',
        },
        {
          prompt: '□ + 3 = 8。哪个减法可以找出空格里的数？',
          answer: '8 − 3', choices: ['8 − 3', '8 + 3', '3 + 3'],
          hint: '先找总数，再去掉已经知道的那一部分。',
          explanation: '8 是总数，3 是一部分。8 − 3 = 5，所以 5 + 3 = 8。',
        },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-within-twenty',
    lesson: {
      id: 'bridge-cross-ten', title: '在 10 的小站停一下',
      homeTip: '吃水果时，可以拿 8 颗葡萄，看看还差几颗到 10。',
      goal: '把要加或要减的数拆成两步，经过 10 后接着算。',
      example: {
        text: '7 加 6，先从 6 里拿 3 和 7 凑成 10。那 6 里还剩 3，再加上去就是 13。',
        model: { kind: 'frame', filled: 7, added: 3, overflow: 3 },
      },
      practice: [
        {
          prompt: '算 8 + 7。先只做第一步，在十格里添到 10。',
          build: { max: 10, fixed: 8, frame: true }, answer: 2,
          hint: '不需要一次添完 7 朵。十格还有几个空位？',
          explanation: '先用 7 里的 2 凑满十格。还剩 5，所以 8 + 7 = 10 + 5 = 15。',
        },
        {
          prompt: '算 14 − 6。先从 14 退到 10，再退完余下的步数。点出终点。',
          line: { min: 6, max: 14, marks: [10, 14] }, answer: 8,
          hint: '14 到 10 已经退了 4 步。6 步里还剩几步？',
          explanation: '先退 4 步到 10，还要退 2 步，最后到 8。',
        },
        {
          prompt: '一篮有 9 个果子，另一篮有 8 个。合起来超过 10 几个？',
          answer: 7, choices: [1, 7, 8],
          hint: '从 8 个里拿 1 个和 9 凑成 10。第二篮还剩几个？',
          explanation: '从 8 个里拿 1 个，还剩 7 个。两篮合起来是 17，比 10 多 7。',
        },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-tens-and-ones',
    lesson: {
      id: 'bridge-bundle-ten', title: '十根一捆，数得更清楚',
      homeTip: '找 24 根吸管，十根扎一捆，再数数有几捆、剩几根。',
      goal: '把散的物件每十个换成一捆，并用十位和个位比较数量。',
      example: {
        text: '24 根小棒，每 10 根捆一捆，可以捆 2 捆，还剩 4 根。换成捆只是换一种数法，总数仍是 24。',
        model: { kind: 'place', digits: [2, 4], labels: ['十', '个'] },
      },
      practice: [
        {
          prompt: '把 26 根散棒每 10 根捆一捆。捆完后有几捆，还剩几根？',
          bundles: { ones: 26 }, answer: '2 捆，剩 6 根', choices: ['2 捆，剩 6 根', '6 捆，剩 2 根', '1 捆，剩 6 根'],
          hint: '每按一次捆 10 根。散棒少于 10 根就停。',
          explanation: '先后捆出两捆，各有 10 根，最后还剩 6 根。',
        },
        {
          prompt: '甲有 3 捆和 1 根，乙有 2 捆和 9 根。每捆一样多，都有 10 根。谁更多？',
          answer: '甲', choices: ['甲', '乙', '一样多'],
          hint: '先比整捆。乙多出来的散棒还凑不够一整捆。',
          explanation: '甲有 31 根，乙有 29 根。3 个十已经比 2 个十加 9 个一多。',
        },
        {
          prompt: '有 2 捆和 9 根，每捆 10 根。再添 1 根散棒，能凑成几捆？',
          answer: 3, choices: [2, 3, 4],
          hint: '新增的 1 根和原来的 9 根能再捆成一捆。',
          explanation: '原来两捆，10 根散棒又捆成一捆，正好三捆。',
        },
      ],
    },
  },
  {
    stage: 'grade-1', after: 'g1-story-problems',
    lesson: {
      id: 'bridge-story-unknown', title: '故事里少说了哪个数',
      goal: '区分未知的是原来的数、变化的数，还是另一组的数。',
      example: {
        text: '桌上原来有一些种子，又添了 3 颗，现在有 9 颗。把后来添的 3 颗去掉，就找到了原来的 6 颗。',
        model: { kind: 'dots', groups: [6, 3] },
      },
      practice: [
        {
          prompt: '鸟窝里原来有一些小鸟，飞走了 4 只，还剩 7 只。原来有几只？',
          answer: 11, choices: [3, 7, 11],
          hint: '原来的小鸟包括留下来的，也包括已经飞走的。',
          explanation: '留下 7 只，飞走 4 只，原来有 7 + 4 = 11 只。',
        },
        {
          prompt: '小雨收集了 12 片叶子，比小林多 3 片。小林收集了几片？',
          answer: 9, choices: [9, 12, 15],
          hint: '题里说小雨更多。小林的数量比 12 大还是小？',
          explanation: '小林比小雨少 3 片，所以小林有 12 − 3 = 9 片。',
        },
        {
          prompt: '书架上原来有 9 本书，后来放进去一些，现在有 15 本。后来放进去几本？',
          answer: 6, choices: [5, 6, 7],
          hint: '从 9 走到 10 用了一步，再从 10 走到 15 用几步？',
          explanation: '后来放进的是 15 和 9 的差。先添 1 本到 10，再添 5 本到 15，共添 6 本。',
        },
      ],
    },
  },
];
