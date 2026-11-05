globalThis.gardenFeedback = new globalThis.GardenFeedbackAudio({enabled: () => gardenPreferences.soundEnabled()});
function playGardenFeedback(correct, anchor) {
  gardenVoice.stop();
  return gardenFeedback.answer(correct, anchor);
}

// Auto-advance only after feedback; the child can continue immediately or after returning from background.
function advanceAfterGardenFeedback(correct, anchor, next) {
  const panel = document.querySelector('#course-root .course-panel');
  for (const control of panel.querySelectorAll('button,input')) control.disabled = true;
  const pending = playGardenFeedback(correct, anchor), token = gardenFeedback.token;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'primary course-action';
  button.dataset.feedbackNext = ''; button.textContent = '继续'; panel.append(button);
  let advanced = false;
  const advance = () => {
    if (advanced || !button.isConnected) return;
    advanced = true; gardenFeedback.stop(); next();
  };
  button.addEventListener('click', advance); button.focus({preventScroll:true});
  Promise.all([pending, new Promise(resolve => setTimeout(resolve, 1450))]).then(() => {
    if (!document.hidden && token === gardenFeedback.token) advance();
  });
}

function shuffleOptions(options) {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function showRetryChoice(buttons, attempted) {
  for (const button of buttons) button.classList.toggle('is-retry', button === attempted);
}
