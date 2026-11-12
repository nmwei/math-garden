function setupChoiceGames() {
  const section = document.querySelector('#choice-game');
  const title = section.querySelector('h1');
  const progress = section.querySelector('.game-progress');
  const status = section.querySelector('[role="status"]');
  const board = document.querySelector('#choice-board');
  const options = document.querySelector('#choice-options');
  const buttons = [...options.querySelectorAll('button')];
  const hear = document.querySelector('#choice-hear');
  const help = document.querySelector('#choice-help');
  const skip = document.querySelector('#choice-skip');
  const replay = document.querySelector('#choice-replay');
  const begin = document.querySelector('#choice-begin');
  const next = document.querySelector('#choice-next');
  const games = [
    { id: 'shapes', game: shapeGame, entry: document.querySelector('#start-shapes'), played: 0 },
    { id: 'patterns', game: patternGame, entry: document.querySelector('#start-patterns'), played: 0 },
    { id: 'compare', game: compareGame, entry: document.querySelector('#start-compare'), played: 0 },
    { id: 'compose', game: composeGame, entry: document.querySelector('#start-compose'), played: 0 },
  ];
  let active;
  let round;
  let question;
  let index;
  let hintLevel;

  function showQuestion(current) {
    stopGardenSpeech();
    const shuffled = shuffleOptions(current.options);
    question = { ...current, options: shuffled, answer: shuffled.indexOf(current.options[current.answer]) };
    hintLevel = 0;
    board.replaceChildren();
    active.game.render(question, board, buttons);
    showRetryChoice(buttons);
    board.hidden = options.hidden = help.hidden = hear.hidden = false;
    skip.hidden = Boolean(round);
    progress.hidden = !round;
    if (round) progress.textContent = `第 ${index + 1} / ${round.length} 题`;
    begin.hidden = replay.hidden = next.hidden = true;
    status.textContent = question.instruction ?? active.game.instruction;
    showGardenSection(section, title);
  }

  function showReady(message, keepBoard = false) {
    stopGardenSpeech();
    round = null;
    board.hidden = !keepBoard;
    options.hidden = help.hidden = hear.hidden = skip.hidden = progress.hidden = next.hidden = true;
    begin.hidden = replay.hidden = false;
    status.textContent = message;
    showGardenSection(section, begin);
  }

  async function finishDemo(message, keepBoard) {
    gardenPreferences.markDemoSeen(active.id);
    try { await gardenAccount.learningStorage.whenSaved(); } catch { return; }
    showReady(message, keepBoard);
  }

  function startDemo() {
    round = null;
    showQuestion(active.game.demo);
  }

  for (const state of games) {
    state.entry.addEventListener('click', () => {
      active = state;
      section.dataset.game = state.id;
      title.textContent = state.game.title;
      if (gardenPreferences.demoSeen(state.id)) showReady('准备好啦，一起来玩吧。');
      else startDemo();
    });
  }
  skip.addEventListener('click', () => finishDemo('准备好啦，一起来玩吧。'));
  replay.addEventListener('click', startDemo);
  begin.addEventListener('click', () => {
    const rounds = active.game.questions;
    round = active.game.makeRound?.(active.played)
      ?? rounds[active.played]
      ?? shuffleOptions(rounds.flat()).slice(0, rounds[0].length);
    index = 0;
    showQuestion(round[index]);
  });
  hear.addEventListener('click', () => sayInGarden(question.spokenPrompt ?? question.instruction ?? active.game.instruction));
  help.addEventListener('click', () => {
    hintLevel = Math.min(hintLevel + 1, 2);
    active.game.hint(question, board, hintLevel);
    status.textContent = active.game.hintText[hintLevel - 1];
  });
  next.addEventListener('click', () => {
    index += 1;
    if (index === round.length) returnToGames(true);
    else showQuestion(round[index]);
  });
  function returnToGames(completed = false) {
    stopGardenSpeech();
    if (completed) active.played += 1;
    showGameList(active.entry, completed);
  }
  document.querySelector('#choice-back').addEventListener('click', () => returnToGames());
  buttons.forEach((button, selected) => {
    button.addEventListener('click', () => {
      if (selected !== question.answer) {
        showRetryChoice(buttons, button);
        playGardenFeedback(false);
        status.textContent = active.game.retry ?? '再看一看，选一次吧。';
        return;
      }
      stopGardenSpeech();
      showRetryChoice(buttons);
      active.game.solve(question, board);
      const success = question.success;
      if (!round) {
        finishDemo(success, true);
        playGardenFeedback(true, board);
        return;
      }
      status.textContent = success;
      options.hidden = help.hidden = hear.hidden = true;
      next.textContent = index === round.length - 1 ? '回游戏列表' : '下一题';
      next.hidden = false;
      next.focus();
      playGardenFeedback(true, board);
    });
  });
}
