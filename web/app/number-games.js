const numberGameFlower = '<img src="./assets/count-flower.svg" alt="" width="34" height="34">';

function renderNumberOptions(question, buttons) {
  buttons.forEach((button, index) => {
    button.hidden = false;
    button.removeAttribute('aria-label');
    button.textContent = question.options[index];
  });
}

function compareQuestion(top, bottom, spaced = false) {
  const conclusion = top === bottom ? '两边一样多。' : top > bottom ? '上面的花更多。' : '下面的花更多。';
  return {
    top, bottom, spaced,
    options: ['上面更多', '一样多', '下面更多'],
    answer: top === bottom ? 1 : top > bottom ? 0 : 2,
    success: `上面有 ${top} 朵，下面有 ${bottom} 朵。${conclusion}`,
  };
}

const compareGame = {
  title: '哪边更多',
  instruction: '比一比，哪边的花更多？也可能一样多。',
  retry: '试着上下一朵对一朵，再选一次。',
  hintText: ['从左边开始，上下一朵对一朵。', '亮起来的是多出来的花。两边都没剩下，就一样多。'],
  demo: compareQuestion(2, 3),
  questions: [
    [compareQuestion(2, 4), compareQuestion(4, 1), compareQuestion(3, 3, true), compareQuestion(4, 5), compareQuestion(2, 4, true)],
    [compareQuestion(1, 3), compareQuestion(5, 2), compareQuestion(4, 4, true), compareQuestion(3, 2), compareQuestion(2, 3, true)],
  ],
  render(question, board, buttons) {
    const paired = Math.min(question.top, question.bottom);
    const rows = [['上面', question.top], ['下面', question.bottom]];
    board.innerHTML = `<div class="number-compare"${question.spaced ? ' data-spaced' : ''}>${rows.map(([label, amount]) => {
      const flowers = Array.from({ length: amount }, (_, index) =>
        `<span${index >= paired ? ' data-extra' : ''}>${numberGameFlower}</span>`).join('');
      return `<div class="number-compare-row">
        <span aria-hidden="true">${label}</span>
        <div class="number-compare-flowers" role="img" aria-label="${label}有 ${amount} 朵花">${flowers}</div>
      </div>`;
    }).join('')}</div>`;
    renderNumberOptions(question, buttons);
  },
  hint(question, board, level) {
    board.firstElementChild.dataset.pairLevel = level;
  },
  solve(question, board) {
    this.hint(question, board, 2);
  },
};

function composeQuestion(capacity, filled) {
  const missing = capacity - filled;
  return {
    capacity, filled,
    options: missing === 0 ? [0, 1, 2] : [missing, missing - 1, missing + 1],
    answer: 0,
    instruction: `花坛有 ${capacity} 格。还要添几朵花才会填满？`,
    success: missing
      ? `原来有 ${filled} 朵，再添 ${missing} 朵，正好 ${capacity} 朵。`
      : '花坛已经满了，不用再添。',
  };
}

const composeGame = {
  title: '凑满花坛',
  retry: '再数数原来空了几格，然后选一次。',
  hintText: ['一格住一朵。点点空格，给它添一朵花。', '数一数带虚线边的格子，这些是原来空着的位置。'],
  demo: composeQuestion(5, 3),
  makeRound(played) {
    if (played === 0) return [4, 3, 2, 1, 5].map(filled => composeQuestion(5, filled));
    if (played === 1) return [composeQuestion(5, 3), composeQuestion(5, 1), ...[8, 7, 6].map(filled => composeQuestion(10, filled))];
    return [
      ...shuffleOptions([1, 2, 3, 4, 5]).slice(0, 2).map(filled => composeQuestion(5, filled)),
      ...shuffleOptions([5, 6, 7, 8, 9, 10]).slice(0, 3).map(filled => composeQuestion(10, filled)),
    ];
  },
  render(question, board, buttons) {
    const { capacity, filled } = question;
    const cells = Array.from({ length: capacity }, (_, index) => index < filled
      ? `<span class="number-frame-cell" aria-hidden="true">${numberGameFlower}</span>`
      : `<button class="number-frame-cell" type="button" aria-label="第 ${index + 1} 格，添花" aria-pressed="false">${numberGameFlower}</button>`);
    board.innerHTML = `<div class="number-frame" role="group" aria-label="${capacity} 格花坛，原有 ${filled} 朵花">${cells.join('')}</div>`;
    board.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'false');
      });
    });
    renderNumberOptions(question, buttons);
  },
  hint(question, board, level) {
    board.firstElementChild.dataset.hint = level;
  },
  solve(question, board) {
    board.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', 'true');
      button.disabled = true;
    });
  },
};
