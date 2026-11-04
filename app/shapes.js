const shapeGame = (() => {
  const shapes = {
    circle: { name: '圆形', path: 'M48 16a32 32 0 1 1 0 64 32 32 0 1 1 0-64Z' },
    triangle: { name: '三角形', path: 'M48 15 83 77H13Z' },
    square: { name: '正方形', path: 'M21 21h54v54H21Z' },
  };
  const paints = ['#e7b89f', '#b4c8a6', '#ebce8c'];

  function question(target, order, turns = [0, 0, 0], sizes = [1, 1, 1]) {
    return {
      cue: shapes[target].name,
      answer: order.indexOf(target),
      options: order.map((kind, index) => ({
        kind, paint: paints[index], turn: turns[index], size: sizes[index],
      })),
    };
  }

  function picture(kind, { paint = 'transparent', turn = 0, size = 1 } = {}) {
    return `<svg class="shape-picture" viewBox="0 0 96 96" aria-hidden="true"
      style="--shape-fill:${paint}; transform:rotate(${turn}deg) scale(${size})">
      <path d="${shapes[kind].path}"/>
    </svg>`;
  }

  return {
    title: '图形找朋友',
    instruction: '看一看这个座位，哪个图形能坐进去？',
    success: '找对啦，图形坐好啦！',
    hintText: ['沿着亮起来的线，看一看座位。', '大小和方向变了，还是同一种图形。'],
    demo: question('triangle', ['circle', 'triangle', 'square']),
    questions: [
      [
        question('circle', ['circle', 'square', 'triangle']),
        question('triangle', ['square', 'triangle', 'circle'], [24, 165, 0], [.77, .86, .72]),
        question('square', ['triangle', 'circle', 'square'], [-24, 0, 45], [.81, .86, .72]),
      ],
      [
        question('triangle', ['triangle', 'circle', 'square']),
        question('square', ['circle', 'square', 'triangle'], [0, -45, 26], [.75, .85, .82]),
        question('circle', ['square', 'triangle', 'circle'], [29, -90, 0], [.83, .81, .71]),
      ],
    ],
    render(current, board, buttons) {
      const target = current.options[current.answer];
      board.innerHTML = `<div class="shape-stage">
        <div class="shape-seat" role="img" aria-label="${current.cue}的轮廓">${picture(target.kind)}</div>
        <div class="shape-example" hidden></div>
      </div>`;
      current.options.forEach((option, index) => {
        buttons[index].hidden = false;
        buttons[index].innerHTML = picture(option.kind, option);
        buttons[index].setAttribute('aria-label', shapes[option.kind].name);
      });
    },
    solve(current, board) {
      const target = current.options[current.answer];
      const seat = board.querySelector('.shape-seat');
      seat.innerHTML = picture(target.kind, { paint: target.paint });
      seat.classList.add('is-solved');
      seat.setAttribute('aria-label', `${current.cue}找到座位了`);
      board.querySelector('.shape-example').hidden = true;
    },
    hint(current, board, level) {
      board.querySelector('.shape-seat').classList.add('is-highlighted');
      if (level < 2) return;
      const example = board.querySelector('.shape-example');
      const target = current.options[current.answer];
      example.innerHTML = `${picture(target.kind, { paint: '#ddd0e4', turn: 32, size: .8 })}
        <span>换个样子，还是同一种图形。</span>`;
      example.hidden = false;
    },
  };
})();
