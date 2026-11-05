function setupCounting() {
  const entry = document.querySelector('#start-counting');
  const counting = document.querySelector('#counting');
  const title = counting.querySelector('h1');
  const status = counting.querySelector('[role="status"]');
  const progress = counting.querySelector('.game-progress');
  const flowerBed = document.querySelector('#flower-bed');
  const flowers = [...flowerBed.querySelectorAll('button')];
  const answers = document.querySelector('#answers');
  const answerButtons = [...answers.querySelectorAll('button')];
  const skip = document.querySelector('#skip-demo');
  const replay = document.querySelector('#replay-demo');
  const begin = document.querySelector('#begin-counting');
  const next = document.querySelector('#next-counting');
  const help = document.querySelector('#help-counting');
  const hear = document.querySelector('#count-hear');
  const amounts = [1, 3, 2, 4, 5];
  const choices = [[1, 3, 2], [3, 4, 2], [2, 3, 4], [5, 4, 2], [3, 4, 5]];
  const numerals = ['一', '二', '三', '四', '五'];
  const countPrompt = '点一朵花，数一个数。';
  const totalPrompt = '一共有几朵花？';
  const countedFlowers = new Set();
  let roundNumber = 0;
  let round;
  let questionIndex;
  let total;
  let helpTimer;

  function stopFeedback() {
    clearTimeout(helpTimer);
    stopGardenSpeech();
  }

  function clearFlowers() {
    countedFlowers.clear();
    flowers.forEach(flower => flower.setAttribute('aria-pressed', 'false'));
  }

  function showQuestion(amount) {
    stopFeedback();
    clearFlowers();
    total = amount;
    flowers.forEach((flower, index) => { flower.hidden = index >= amount; });
    const options = shuffleOptions(choices[amount - 1]);
    answerButtons.forEach((button, index) => { button.textContent = options[index]; });
    showRetryChoice(answerButtons);
    flowerBed.classList.toggle('scattered', Boolean(round && amount > 1 && questionIndex >= 2));
    flowerBed.classList.remove('celebrate');
    flowerBed.hidden = false;
    progress.hidden = !round;
    if (round) progress.textContent = `第 ${questionIndex + 1} / ${round.length} 题`;
    skip.hidden = Boolean(round);
    help.hidden = !round;
    hear.hidden = hear.disabled = help.disabled = false;
    answers.hidden = begin.hidden = replay.hidden = next.hidden = true;
    status.textContent = countPrompt;
    showGardenSection(counting, title);
  }

  function showReady(message, keepFlowers = false) {
    stopFeedback();
    round = null;
    flowerBed.hidden = !keepFlowers;
    progress.hidden = answers.hidden = skip.hidden = help.hidden = next.hidden = true;
    hear.hidden = true;
    begin.hidden = replay.hidden = false;
    status.textContent = message;
    showGardenSection(counting, begin);
  }

  function finishDemo(message, keepFlowers) {
    gardenPreferences.markDemoSeen('counting');
    showReady(message, keepFlowers);
  }

  function markFlower(flower) {
    countedFlowers.add(flower);
    flower.setAttribute('aria-pressed', 'true');
    const count = countedFlowers.size;
    sayInGarden(numerals[count - 1]);
    status.textContent = `数到 ${count} 了，再点一朵。`;
  }

  function askTotal(moveFocus = true) {
    status.textContent = totalPrompt;
    answers.hidden = false;
    if (moveFocus) answerButtons[0].focus();
  }

  function countWithHelp() {
    clearFlowers();
    help.disabled = hear.disabled = answers.hidden = true;
    title.focus();
    function step() {
      const count = countedFlowers.size;
      if (count === total) {
        help.disabled = hear.disabled = false;
        askTotal(document.activeElement === title);
        return;
      }
      markFlower(flowers[count]);
      status.textContent = `一起数，${count + 1}。`;
      helpTimer = setTimeout(step, 700);
    }
    step();
  }

  function startDemo() {
    round = null;
    showQuestion(3);
  }

  entry.addEventListener('click', () => {
    if (gardenPreferences.demoSeen('counting')) showReady('准备好啦，一起来数花吧。');
    else startDemo();
  });
  replay.addEventListener('click', startDemo);
  skip.addEventListener('click', () => finishDemo('准备好啦，一起来数花吧。'));
  begin.addEventListener('click', () => {
    round = roundNumber ? shuffleOptions(amounts) : amounts;
    questionIndex = 0;
    showQuestion(round[questionIndex]);
  });
  help.addEventListener('click', countWithHelp);
  hear.addEventListener('click', () => sayInGarden(answers.hidden ? countPrompt : totalPrompt));
  next.addEventListener('click', () => {
    questionIndex += 1;
    if (questionIndex === round.length) returnToGames(true);
    else showQuestion(round[questionIndex]);
  });
  function returnToGames(completed = false) {
    stopFeedback();
    if (completed) roundNumber += 1;
    showGameList(entry, completed);
  }
  document.querySelector('#count-back').addEventListener('click', () => returnToGames());

  for (const flower of flowers) {
    flower.addEventListener('click', () => {
      if (help.disabled || countedFlowers.has(flower)) return;
      markFlower(flower);
      if (countedFlowers.size === total) askTotal();
    });
  }

  for (const answer of answerButtons) {
    answer.addEventListener('click', () => {
      if (Number(answer.textContent) !== total) {
        showRetryChoice(answerButtons, answer);
        playGardenFeedback(false);
        status.textContent = '再看看有几朵花，然后选一次。';
        return;
      }
      showRetryChoice(answerButtons);
      const message = `数对啦，一共有 ${total} 朵花。`;
      flowerBed.classList.add('celebrate');
      if (!round) {
        finishDemo(message, true);
        playGardenFeedback(true, flowerBed);
        return;
      }
      status.textContent = message;
      answers.hidden = help.hidden = hear.hidden = true;
      next.textContent = questionIndex === round.length - 1 ? '回游戏列表' : '下一题';
      next.hidden = false;
      next.focus();
      playGardenFeedback(true, flowerBed);
    });
  }
  return stopFeedback;
}
