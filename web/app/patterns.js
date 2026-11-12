const patternFigures = {
  A: {
    label: '花朵',
    drawing: '<path d="M18 13c-6-9 5-14 8-6 7-6 14 3 7 8 9 4 3 15-5 11-1 9-13 9-13 0-8 4-14-7-5-11-3-7 6-11 8-2Z"/><circle cx="22" cy="19" r="4" fill="#f8e8b3"/>',
  },
  B: {
    label: '叶子',
    drawing: '<path d="M8 28C5 16 17 7 35 7c0 17-8 27-21 25Z"/><path d="M8 34c5-7 11-12 20-20" fill="none" stroke="#3e644d" stroke-width="2" stroke-linecap="round"/>',
  },
  C: {
    label: '果子',
    drawing: '<circle cx="22" cy="23" r="11" fill="#d6a0aa"/><path d="M22 14c2-6 6-8 11-8-1 5-4 9-11 8Z" fill="#729272"/>',
  },
};

function patternFigure(symbol) {
  return `<svg class="pattern-figure" viewBox="0 0 42 38" aria-hidden="true" focusable="false">${patternFigures[symbol].drawing}</svg>`;
}

function patternQuestion(unit, extra = 0, order = 'AB') {
  const sequence = unit.repeat(2) + unit.slice(0, extra);
  const names = [...sequence].map(symbol => patternFigures[symbol].label);
  const group = names.slice(0, unit.length).join('、');
  return {
    unit, extra, options: [...order], answer: order.indexOf(unit[extra]),
    spokenPrompt: `${names.join('、')}。下一格放什么？`,
    success: `「${group}」一组一组地重复，下一格接${patternFigures[unit[extra]].label}。`,
  };
}

function patternStep(symbol, position) {
  const label = symbol ? patternFigures[symbol].label : '空格';
  const content = symbol ? patternFigure(symbol) : '<span aria-hidden="true">?</span>';
  const empty = symbol ? '' : ' pattern-step--empty';
  return `<span class="pattern-step${empty}" role="img" aria-label="第 ${position} 格：${label}">${content}</span>`;
}

const patternGame = {
  title: '接着排一排',
  instruction: '看看花叶小路，点一点，下一格放什么？',
  hintText: ['看看框起来的两组，它们一样吗？', '跟着亮起来的花叶读一遍，再接下去。'],
  demo: patternQuestion('AB', 1, 'BA'),
  questions: [
    [patternQuestion('AB'), patternQuestion('AB', 1), patternQuestion('BA', 0, 'BA'),
      patternQuestion('AAB', 1), patternQuestion('ABB', 2)],
    [patternQuestion('AAB', 2), patternQuestion('ABB', 1, 'BA'), patternQuestion('AAB', 0, 'BA'),
      patternQuestion('ABC', 1, 'CAB'), patternQuestion('BCA', 2, 'ABC')],
  ],
  render(question, board, optionButtons) {
    const { unit, extra, options } = question;
    const repeats = [unit, unit, unit.slice(0, extra)];
    let position = 0;
    const groups = repeats.map((symbols, index) => {
      const steps = [...symbols].map((symbol) => patternStep(symbol, ++position));
      const complete = index < 2;
      if (!complete) steps.push(patternStep(null, ++position));
      const className = complete ? 'pattern-unit pattern-unit--complete' : 'pattern-unit';
      return `<div class="${className}" style="--steps: ${steps.length}">${steps.join('')}</div>`;
    });
    board.innerHTML = `<div class="pattern-path" role="group" aria-label="花叶小路">${groups.join('')}</div>`;
    for (const [index, button] of optionButtons.entries()) {
      const symbol = options[index];
      button.hidden = !symbol;
      if (!symbol) continue;
      button.innerHTML = patternFigure(symbol);
      button.setAttribute('aria-label', patternFigures[symbol].label);
    }
  },
  solve(question, board) {
    const last = board.querySelector('.pattern-step--empty');
    const symbol = question.options[question.answer];
    const position = question.unit.length * 2 + question.extra + 1;
    last.innerHTML = patternFigure(symbol);
    last.setAttribute('aria-label', `第 ${position} 格：${patternFigures[symbol].label}`);
    last.classList.replace('pattern-step--empty', 'pattern-step--solved');
  },
  hint(question, board, level) {
    board.querySelector('.pattern-path').dataset.hint = level;
  },
};
