// The same model and reasoning stay useful when the details of the story change.
const courseStoryWorkshop = (() => {
  function shopping(item, extra, bags, price, extraPrice, budget) {
    const bagsTotal = bags * price;
    const total = bagsTotal + extraPrice;
    const change = budget - total;
    const totalMethod = `${bags} × ${price} + ${extraPrice}`;
    const checkMethod = '把两样东西的总价和找回的钱相加';
    return {
      context: `你带了 ${budget} 元去花园小摊。${item}每包 ${price} 元，要买 ${bags} 包，还要买一份 ${extraPrice} 元的${extra}。把带的钱都交给店员，能找回多少元？`,
      steps: [
        {
          prompt: `先把${item}的钱画成一条图。每格表示一包的 ${price} 元，从左边开始涂，需要几格？`,
          build: { max: 5, token: 'bar', label: `${item}，每格 ${price} 元` }, answer: bags,
          hint: '每一包用一格来表示，先数有几包。',
          explanation: `画 ${bags} 个一样的格，每格 ${price} 元，表示 ${bags} 份 ${price} 元。`,
        },
        {
          prompt: '图里还要加上另一件东西的价钱。哪个算式能算出一共要付多少钱？',
          model: {
            kind: 'tape', total: '? 元',
            parts: [{ size: bagsTotal, label: `${bags} 个 ${price} 元` }, { size: extraPrice, label: `${extraPrice} 元` }],
          },
          choices: [`${price} + ${extraPrice}`, totalMethod, `${bags} ×（${price} + ${extraPrice}）`],
          answer: totalMethod,
          hint: `${item}有 ${bags} 份，${extra}只有一份。`,
          explanation: `${bags} 包${item}花 ${bagsTotal} 元，加上一份${extra}的 ${extraPrice} 元，一共是 ${total} 元。`,
        },
        {
          prompt: '付完这两样东西的钱，还剩多少元？',
          answer: change,
          hint: '用原来带的钱减去两样东西的总价。',
          explanation: `${budget} − ${total} = ${change}，还剩 ${change} 元。`,
        },
        {
          prompt: '你拿到了找回的钱。哪种办法能检查找回的钱对不对？',
          choices: ['把买的份数和找回的钱相加', '只把一包的价钱和找回的钱相加', checkMethod],
          answer: checkMethod,
          hint: '付出去的钱和找回来的钱合起来，应该等于原来的钱。',
          explanation: `${total} + ${change} = ${budget}。两样东西的总价加上找回的钱，正好等于原来带的钱。`,
        },
      ],
      explain: `在纸上画图讲一讲，哪一段要画好几份，哪一段只有一份？如果少买一包${item}，找回的钱会多多少？你怎么知道？`,
      reflection: `${item}那一段有 ${bags} 格，${extra}只有一份。少买一包就少付 ${price} 元，找回的钱会多 ${price} 元。`,
    };
  }

  function clock(minutes) {
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  }

  function schedule(start, trip, activity, deadline, place, action) {
    const hour = Math.ceil(start / 60) * 60;
    const toHour = hour - start;
    const arrive = start + trip;
    const finish = arrive + activity;
    const spare = deadline - finish;
    const segments = Array.from({ length: trip / 5 }, (_, index) =>
      `${clock(start + index * 5)} 到 ${clock(start + (index + 1) * 5)}`);
    const remainingTrip = trip - toHour;
    const afterHourMethod = `${trip} − ${toHour}`;
    const compareMethod = '从活动结束的时刻数到集合的时刻';
    return {
      context: `${clock(start)} 从入口出发，走 ${trip} 分钟到${place}，接着用 ${activity} 分钟${action}。${clock(deadline)} 集合。活动结束时离集合还有几分钟？`,
      steps: [
        {
          prompt: `在时间线上，涂出从出发时刻到 ${clock(hour)} 的每一小段。每段是 5 分钟。`,
          marks: { kind: 'timeline', labels: segments },
          answer: segments.slice(0, toHour / 5).map((_, index) => index),
          hint: `找出发时刻，再找 ${clock(hour)}，只涂这两个时刻之间的小段。`,
          explanation: `从 ${clock(start)} 到 ${clock(hour)} 有 ${toHour / 5} 个 5 分钟，共 ${toHour} 分钟。`,
        },
        {
          prompt: `过了 ${clock(hour)}，还要走多久才到${place}？选出能算出这段时间的式子。`,
          choices: [`${trip} + ${toHour}`, afterHourMethod, `60 − ${trip}`], answer: afterHourMethod,
          hint: '用走路总共需要的时间，减掉整点前已经走的时间。',
          explanation: `${afterHourMethod} = ${remainingTrip}。整点后还走 ${remainingTrip} 分钟，${clock(arrive)} 到达。`,
        },
        {
          prompt: `到达后用 ${activity} 分钟${action}。活动结束时，离集合还有几分钟？`,
          answer: spare,
          hint: `先从到达的 ${clock(arrive)} 加上活动时间，再和 ${clock(deadline)} 比。`,
          explanation: `${clock(arrive)} 再过 ${activity} 分钟到 ${clock(finish)}。数到 ${clock(deadline)}，还剩 ${spare} 分钟。`,
        },
        {
          prompt: '要找的是还能等多久。应当看时间线上的哪一段？',
          choices: [compareMethod, '从出发的时刻数到集合的时刻', '从到达的时刻数到活动结束的时刻'],
          answer: compareMethod,
          hint: '路上和做活动的时间已经用掉了。',
          explanation: '等候从活动结束才开始，到集合时结束。两点之间是等候时间。',
        },
      ],
      explain: '在纸上画时间线，指一指走路、活动和等候分别是哪一段。如果路上多用 5 分钟，其他安排不变，等候时间会怎样变？',
      reflection: `先走 ${trip} 分钟到 ${clock(arrive)}，再用 ${activity} 分钟到 ${clock(finish)}，最后等 ${spare} 分钟。路上多花 5 分钟，等候时间就少 5 分钟。`,
    };
  }

  function fence(site, length, width, opening, price) {
    const edges = ['上边', '右边', '下边', '左边'];
    const lengths = [length, width, length, width];
    const fenced = lengths.map((_, index) => index).filter(index => index !== opening);
    const selectedLengths = fenced.map(index => lengths[index]);
    const metres = selectedLengths.reduce((sum, value) => sum + value, 0);
    const cost = metres * price;
    const lengthMethod = selectedLengths.join(' + ');
    const explainLength = '围栏沿着边走，每段按它的长度收费';
    return {
      context: `长方形${site}的横边各长 ${length} 米，竖边各长 ${width} 米。靠小路的${edges[opening]}整条留空，另外三条边围上围栏。每米 ${price} 元，一共要花多少元？`,
      steps: [
        {
          prompt: '在图上点亮需要装围栏的边。点一下可以画上，再点可以擦掉。',
          marks: { kind: 'edges', labels: edges.map((edge, index) => `${edge} · ${lengths[index]} 米`) },
          answer: fenced,
          hint: `先找靠小路的${edges[opening]}。这一条边留空，只画其余三条。`,
          explanation: `留空的是${edges[opening]}，需要围起来的是${fenced.map(index => edges[index]).join('、')}。`,
        },
        {
          prompt: '哪个式子是把刚画出的三条边的长度加起来？',
          choices: [`${length} × ${width}`, `（${length} + ${width}）× 2`, lengthMethod],
          answer: lengthMethod,
          hint: '沿着刚画的边走一遍，只把这三条边的长度相加。',
          explanation: `${lengthMethod} = ${metres}，需要 ${metres} 米围栏。`,
        },
        {
          prompt: `每米围栏 ${price} 元。一共要付多少元？`,
          answer: cost,
          hint: '每一米都要付同样多的钱，按总长度乘每米的价钱。',
          explanation: `${metres} × ${price} = ${cost}，围栏一共要花 ${cost} 元。`,
        },
        {
          prompt: '有人想用长乘宽来决定围栏要买多少米。为什么先把需要围的边加起来更合适？',
          choices: ['围栏把地里面全部铺满了', explainLength, '四条边的长度都一样'],
          answer: explainLength,
          hint: '围栏在图的里面，还是只沿边安装？',
          explanation: '长乘宽算的是里面的面积。围栏只走边线，按米计费，所以要用选中边线的长度。',
        },
      ],
      explain: `在纸上画出原来要围的边，讲一讲哪条留空。如果给${edges[opening]}也加围栏，总价会多多少？`,
      reflection: `${edges[opening]}没有围，长 ${lengths[opening]} 米。加上它就要多买 ${lengths[opening]} 米，按每米 ${price} 元算，会多花 ${lengths[opening] * price} 元。`,
    };
  }

  return [
    {
      id: 'garden-stall', title: '逛花园小摊', lessonId: 'mixed-stories',
      description: '画出几包同价的物品，算一算总价和找回的钱。',
      variants: [
        shopping('花种', '花签', 4, 12, 5, 60),
        shopping('装饰石', '小花盆', 5, 9, 7, 60),
        shopping('营养土', '园艺手套', 3, 14, 6, 54),
      ],
    },
    {
      id: 'garden-visit', title: '赶上花园集合', lessonId: 'g3-measure-intervals',
      description: '用时间线安排走路、活动和等候，看看能不能准时到。',
      variants: [
        schedule(9 * 60 + 45, 25, 10, 10 * 60 + 25, '温室', '观察幼苗'),
        schedule(10 * 60 + 50, 20, 15, 11 * 60 + 35, '池塘', '记录小鱼'),
        schedule(13 * 60 + 40, 35, 5, 14 * 60 + 35, '观鸟台', '画下看到的鸟'),
      ],
    },
    {
      id: 'garden-fence', title: '给花坛装围栏', lessonId: 'perimeter',
      description: '把要围的边画出来，再按实际长度算材料费。',
      variants: [
        fence('花坛', 7, 4, 2, 9),
        fence('草药地', 6, 5, 1, 8),
        fence('育苗地', 8, 3, 0, 7),
      ],
    },
  ];
})();

const courseDataWorkshop = (() => {
  function voting(first, second, firstBars, secondBars, scale, combine = false) {
    const firstVotes = firstBars * scale;
    const secondVotes = secondBars * scale;
    const sum = firstVotes + secondVotes;
    const difference = firstVotes - secondVotes;
    const sumMethod = `（${firstBars} + ${secondBars}）× ${scale}`;
    const differenceMethod = `（${firstBars} − ${secondBars}）× ${scale}`;
    const question = combine ? '这两项一共有多少票？' : `${first}比${second}多几票？`;
    const reason = `每格代表的是 ${scale} 票，要把格数换成票数`;
    return {
      context: `花园在投票选活动。条形图每格表示 ${scale} 票。「${first}」那一行已经画好，「${second}」收到 ${secondVotes} 票。${question}`,
      steps: [
        {
          prompt: `补画「${second}」的那一行。每格代表 ${scale} 票，${secondVotes} 票应画几格？`,
          model: { kind: 'bars', items: [[first, firstBars]] },
          build: { max: 5, token: 'bar', label: second }, answer: secondBars,
          hint: `数有几个 ${scale} 票，够一个 ${scale} 票就填一格。`,
          explanation: `${secondVotes} ÷ ${scale} = ${secondBars}，所以填 ${secondBars} 格。`,
        },
        {
          prompt: `看画好的两条。${question}先选一个能回答这个问题的算式。`,
          model: { kind: 'bars', items: [[first, firstBars], [second, secondBars]] },
          choices: [sumMethod, `${firstBars} ${combine ? '+' : '−'} ${secondBars}`, differenceMethod],
          answer: combine ? sumMethod : differenceMethod,
          hint: combine ? '先把格数合起来，再看每格表示几票。' : '先看两条相差几格，再用图例把格数换成票数。',
          explanation: combine
            ? `两条共有 ${firstBars + secondBars} 格，一格 ${scale} 票。也可以把两项的票数分别算出来再相加。`
            : `两条相差 ${firstBars - secondBars} 格，一格 ${scale} 票。也可以把两项的票数分别算出来再相减。`,
        },
        {
          prompt: question,
          answer: combine ? sum : difference,
          hint: '答案的单位是票。用上一步选出的算式算一算。',
          explanation: combine
            ? `${firstVotes} + ${secondVotes} = ${sum}，两项共收到 ${sum} 票。`
            : `${firstVotes} − ${secondVotes} = ${difference}，${first}多 ${difference} 票。`,
        },
        {
          prompt: '为什么只看格数还不能得到题目问的票数？',
          choices: [reason, '每格都是一票，只要数格', '每一条有几格都算成一票'],
          answer: reason,
          hint: '回看题目里的图例，一格是几票？',
          explanation: '格数告诉我们有几组。每组的票数由图例决定，必须带上这一信息。',
        },
      ],
      explain: `如果改用一格表示一票，「${second}」这一条要画几格？实际票数会变吗？`,
      reflection: `要画 ${secondVotes} 格。每格的单位变小了，表示同一批票就得画更多格，实际票数还是 ${secondVotes} 票。`,
    };
  }

  return {
    id: 'garden-votes', title: '给花园活动计票', lessonId: 'read-data',
    description: '补画有图例的条形图，再比较票数或求总票数。',
    variants: [
      voting('水培', '观鸟', 5, 3, 2),
      voting('插花', '拓印', 6, 4, 3, true),
      voting('种豆', '画叶', 7, 2, 5),
    ],
  };
})();
