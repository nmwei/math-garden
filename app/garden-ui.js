globalThis.gardenFeedback = new globalThis.GardenFeedbackAudio({enabled: () => gardenPreferences.soundEnabled()});
function playGardenFeedback(correct) {
  gardenVoice.stop();
  return gardenFeedback.play(correct);
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
