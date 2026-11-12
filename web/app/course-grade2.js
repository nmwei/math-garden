const gradeTwo = {
  id: 'grade-2',
  label: '进阶',
  reference: '小学二年级常见内容',
  title: '让数和图形帮我们解决问题',
  description: '在万以内认识数位，用等组、分物和图表解决花园里的小问题。',
  lessons: [
    {
      id: 'numbers-within-10000',
      title: '认识万以内的数',
      goal: '用千、百、十、个位解释一个数，并从高位开始比较大小。',
      example: {
        text: '3 个千、0 个百、4 个十和 6 个一组成 3046。百位写 0，表示没有整百。比较 3046 和 3406 时，千位相同，再看百位。',
        model: { kind: 'place', digits: [3, 0, 4, 6], labels: ['千', '百', '十', '个'] },
      },
      practice: [
        {
          prompt: '2 个千、0 个百、7 个十和 5 个一，组成几？',
          answer: 2075, choices: [2705, 2075, 2057],
          hint: '从千位到个位排好，百位没有就写 0。',
          explanation: '2000 + 70 + 5 = 2075。',
        },
        {
          prompt: '花园收了 3987 粒花籽，苗圃收了 4002 粒。哪边收得多？',
          answer: '苗圃', choices: ['花园', '苗圃', '一样多'],
          hint: '从千位开始比，先看 3 和 4。',
          explanation: '苗圃的 4002 有 4 个千，比 3987 的 3 个千多。',
        },
        {
          prompt: '给从小到大编号的牌子补上下一张。3998，3999，接下来是几？',
          answer: 4000,
          hint: '3999 再添 1，个位满十以后，想想还要向哪些数位进 1。',
          explanation: '个位、十位、百位依次满十，最后千位从 3 变成 4，得到 4000。',
        },
      ],
    },
    {
      id: 'regroup-add-subtract',
      title: '换一换，再加减',
      goal: '理解 10 个一换 1 个十，1 个十拆成 10 个一。',
      example: {
        text: '37 加 18，先看个位。7 加 8 是 15，把 10 个一换成 1 个十，余下 5 个一。十位合起来是 5 个十，所以答案是 55。',
        model: { kind: 'place', digits: [3, 7], labels: ['十', '个'] },
      },
      practice: [
        {
          prompt: '柜子里有 46 只花盆，又放进 27 只。现在一共有几只？',
          answer: 73,
          hint: '6 加 7 得 13。把其中 10 个一换成 1 个十。',
          explanation: '4 个十、2 个十和新换出的 1 个十合成 7 个十，剩 3 个一，所以是 73。',
        },
        {
          prompt: '有 52 张卡纸，用了 28 张。还剩几张？',
          answer: 24,
          hint: '个位的 2 不够减 8。把 1 个十换成 10 个一。',
          explanation: '52 可以看成 4 个十和 12 个一。减去 2 个十和 8 个一，还剩 2 个十和 4 个一。',
        },
        {
          prompt: '小雨算出 61 减 24 等于 47。用哪个加法算式可以检查她的答案？',
          answer: '47 + 24', choices: ['47 + 61', '61 + 24', '47 + 24'],
          hint: '如果 47 是正确的剩余量，加回拿走的 24 应该还原到 61。',
          explanation: '47 + 24 = 71，不能还原到 61。正确的剩余量是 37，37 + 24 = 61。',
        },
      ],
    },
    {
      id: 'equal-groups-multiply',
      title: '相同的几组可以用乘法',
      goal: '从几组相同的数量、点阵和连加理解乘法。',
      example: {
        text: '2 行，每行 3 盆，是 2 个 3。可以把 3 + 3 写成 2 × 3。',
        model: { kind: 'grid', rows: 2, cols: 3, outline: true },
      },
      practice: [
        {
          prompt: '这块花圃有 4 行，每行 5 朵花。一共有几朵？',
          model: { kind: 'grid', rows: 4, cols: 5, outline: true },
          answer: 20,
          hint: '从每行数 5 朵开始，连加 4 次。',
          explanation: '4 个 5 是 5 + 5 + 5 + 5，也就是 4 × 5 = 20。',
        },
        {
          prompt: '6 个花架，每个摆 3 个花盆。哪个算式表示总盆数？',
          answer: '6 × 3', choices: ['6 + 3', '6 × 3', '6 × 6'],
          hint: '有 6 组，每组 3 个，用乘法表示。',
          explanation: '6 × 3 表示 6 个 3，等于 18 盆。',
        },
        {
          prompt: '7 组小朋友，每组种 4 棵苗。一共种了几棵？',
          answer: 28, choices: [24, 28, 32],
          hint: '先算 5 组有 20 棵，再加剩下 2 组的棵数。',
          explanation: '5 个 4 是 20，2 个 4 是 8，合起来有 28 棵。',
        },
      ],
    },
    {
      id: 'share-and-group',
      title: '分一分，正好还是有剩',
      goal: '区分平均分成几份和每份有几个，知道余数比除数小。',
      example: {
        text: '12 个果子平均放在 3 个盘里，每盘 4 个。若每盘放 3 个，同样的 12 个果子会装满 4 盘。',
        model: { kind: 'grid', rows: 3, cols: 4, outline: true },
      },
      practice: [
        {
          prompt: '18 颗花籽平均分给 3 个小朋友。每人分几颗？',
          answer: 6,
          hint: '找一找，3 个几合起来是 18？',
          explanation: '18 ÷ 3 = 6，3 人各拿 6 颗，正好用完。',
        },
        {
          prompt: '20 个标签，每 4 个装一袋。能装几袋？',
          answer: 5, choices: [4, 5, 6],
          hint: '想一想，几个 4 合起来是 20？',
          explanation: '5 × 4 = 20，所以能装满 5 袋。',
        },
        {
          prompt: '把 14 个松果每 4 个装一袋。装满能装的袋子后，还剩几个松果？',
          answer: 2, choices: [2, 3, 4],
          hint: '先装 3 袋，用了 12 个，再看看还剩多少。',
          explanation: '14 = 3 × 4 + 2。剩下 2 个，凑不满一袋。',
        },
      ],
    },
    {
      id: 'clock-coins',
      title: '看时间，算零钱',
      goal: '读简单钟面，按小时和分钟比较时长，认识元与角。',
      example: {
        text: '时针刚过 3，分针指向 6，表示 3 时 30 分。从 3 时到 3 时 30 分过了半小时。1 小时有 60 分钟。',
        model: { kind: 'clock', hour: 3, minute: 30 },
      },
      practice: [
        {
          prompt: '花园活动在图上的时间开始，钟面表示几点几分？',
          model: { kind: 'clock', hour: 9, minute: 15 },
          answer: '9 时 15 分', choices: ['3 时 45 分', '9 时 3 分', '9 时 15 分'],
          hint: '先看短针过了几，再看长针走了几个 5 分钟。',
          explanation: '短针刚过 9，长针指向 3。3 个 5 分钟是 15 分钟。',
        },
        {
          prompt: '从上午 9 时 30 分到上午 10 时，一共过了多少分钟？',
          answer: 30, choices: [20, 30, 40],
          hint: '从 9 时 30 分走到 10 时整，还差半小时。',
          explanation: '60 分钟的一半是 30 分钟。',
        },
        {
          prompt: '一个小花盆要 8 角。付 1 元，应找回几角？',
          answer: 2,
          hint: '先把 1 元换成 10 角。',
          explanation: '10 角减去 8 角，还剩 2 角。',
        },
      ],
    },
    {
      id: 'measure-and-turn',
      title: '量长度，辨方向，找图形',
      goal: '用合适的长度单位，分辨方向的改变并描述图形特征。',
      example: {
        text: '用尺子量花签，如果左端对准 2 厘米、右端对准 7 厘米，中间相隔 5 厘米。量的是两个刻度之间的距离。',
        model: { kind: 'line', min: 0, max: 10, marks: [2, 7], jump: [2, 7] },
      },
      practice: [
        {
          prompt: '想记录花园长椅的长度，写「长约 2 什么」最合适？',
          answer: '米', choices: ['米', '厘米', '角'],
          hint: '想想 1 米和 1 厘米在生活中各有多长。',
          explanation: '长椅大约有 2 米长。2 厘米接近一枚小纽扣的宽度，角是钱的单位。',
        },
        {
          prompt: '地图上小虫面朝上方，向自己的右手边转四分之一圈。现在它面朝哪里？',
          model: { kind: 'text', text: '开始方向 ↑' },
          answer: '右方', choices: ['右方', '左方', '下方'],
          hint: '用手指比方向，像钟表指针一样转四分之一圈。',
          explanation: '从朝上顺时针转四分之一圈，就朝右了。',
        },
        {
          prompt: '四条边一样长、四个角都是直角的图形是什么？',
          model: { kind: 'shapes', items: ['rectangle', 'triangle', 'square'] },
          answer: '正方形', choices: ['圆形', '正方形', '长方形'],
          hint: '先看哪些图形有四条边，再看边是不是一样长。',
          explanation: '正方形有四条相等的边和四个直角。',
        },
      ],
    },
    {
      id: 'sort-count-data',
      title: '分类、记下来、读出来',
      goal: '按同一个标准分类，用图表记录数量并比较。',
      example: {
        text: '把花园照片按「拍的是花还是叶」分组。每拍到一张，就在对应组里画一格，最后比较两组有多少张。',
        model: { kind: 'bars', items: [['花', 3], ['叶', 2]] },
      },
      practice: [
        {
          prompt: '要知道各种颜色的花盆有几个，应该先按什么分类？',
          answer: '颜色', choices: ['颜色', '大小', '摆放的位置'],
          hint: '分类标准要和想回答的问题一致。',
          explanation: '按颜色分组后，数每组有几个，就能知道各种颜色花盆的数量。',
        },
        {
          prompt: '每一格代表 1 张照片。比起小桥，拍花圃的照片多几张？',
          model: { kind: 'bars', items: [['花圃', 6], ['小桥', 4], ['树屋', 3]] },
          answer: 2, choices: [2, 3, 10],
          hint: '只比较花圃和小桥。可以把它们的格子一个对一个配起来。',
          explanation: '6 张花圃照片减去 4 张小桥照片，相差 2 张。',
        },
        {
          prompt: '每一格代表 1 枚贴纸。橙色和绿色贴纸合起来有几枚？',
          model: { kind: 'bars', items: [['橙色', 5], ['绿色', 3], ['紫色', 4]] },
          answer: 8,
          hint: '只找橙色和绿色两组。',
          explanation: '橙色有 5 枚，绿色有 3 枚，合起来是 8 枚。',
        },
      ],
    },
    {
      id: 'garden-story-models',
      title: '先画一画，再解故事题',
      goal: '找出每份数量、总量和差，把相关数量画成等组图或线段。',
      example: {
        text: '两排花各有 4 朵，另有 3 朵待种。先用 2 × 4 算出排里的 8 朵，再加 3 朵，合起来 11 朵。',
        model: { kind: 'dots', groups: [4, 4, 3] },
      },
      practice: [
        {
          prompt: '有 3 个托盘，每个放 4 盆花，另外有 2 盆还在桌上。一共有几盆花？',
          model: { kind: 'dots', groups: [4, 4, 4, 2] },
          answer: 14,
          hint: '先算 3 个托盘里的花盆，再加桌上的。',
          explanation: '3 × 4 = 12，12 + 2 = 14。',
        },
        {
          prompt: '甲组做了 27 张书签，乙组比甲组少 8 张。乙组做了几张？',
          answer: 19, choices: [19, 21, 35],
          model: { kind: 'tape', total: 27, parts: [{ size: 19, label: '?' }, { size: 8, label: '少 8' }] },
          hint: '画一条表示 27 张的线段。从末端去掉表示 8 张的一段。',
          explanation: '乙组的数量比 27 少 8，27 − 8 = 19。',
        },
        {
          prompt: '借来的 24 把小铲子平均放在 6 张桌上。每张桌拿走 1 把后，每张桌还剩几把？',
          answer: 3,
          hint: '先求平均每桌原来有几把，再从每桌的数量里减去 1。',
          explanation: '24 ÷ 6 = 4。每张桌原来有 4 把，拿走 1 把后剩 3 把。',
        },
      ],
    },
  ],
};
