function renderCourseBuild({ max, fixed = 0, frame }) {
  const label = (frame ? '十格花坛' : '花位') + (fixed ? `，已有 ${fixed} 朵花` : '');
  return `<div class="course-build${frame ? ' course-build-frame' : ''}" role="group" aria-label="${label}">
    ${courseCells(max, index => index < fixed
      ? `<span class="course-plot course-fixed">${flowerDot(index, false)}</span>`
      : `<button type="button" class="course-plot" aria-label="第 ${index + 1} 格" aria-pressed="false" data-plot><img src="./assets/count-flower.svg" alt="" width="36" height="36"></button>`)}
  </div><button type="button" data-action="check-build" class="primary course-action">放好了</button>`;
}

function renderCourseLineInput({ min, max, marks = [] }) {
  return `<div class="course-line-input" role="group" aria-label="选数轴上的数">
    ${courseCells(max - min + 1, index => {
      const value = min + index;
      const start = marks.includes(value);
      return `<button type="button" class="${start ? 'course-line-marked' : ''}" data-line-value="${value}" aria-label="数轴上的 ${value}${start ? '，起点' : ''}">${value}</button>`;
    })}
  </div>`;
}

function renderBundleTray(loose, tens = 0) {
  return `<div class="course-bundle-tray" data-loose="${loose}" data-tens="${tens}">
    <div class="course-bundles" role="group" aria-label="${tens} 捆，每捆十根">
      ${courseCells(tens, () => '<span class="course-ten-bundle">10 根</span>')}
    </div>
    <div class="course-loose" role="img" aria-label="${loose} 根散棒">
      ${courseCells(loose, () => '<i></i>') || '<span>没有散棒</span>'}
    </div>
    ${loose >= 10 ? '<button type="button" class="course-action" data-action="bundle">把 10 根捆一捆</button>' : ''}
    <p class="course-note" aria-live="polite">${loose >= 10 ? '够十根就能再捆一捆。' : '捆好了。数数有几捆、几根散棒。'}</p>
  </div>`;
}

function bundleCourseSticks(button, root) {
  const tray = button.closest('.course-bundle-tray');
  const loose = Number(tray.dataset.loose) - 10;
  const tens = Number(tray.dataset.tens) + 1;
  tray.outerHTML = renderBundleTray(loose, tens);
  if (loose < 10) {
    const choices = [...root.querySelectorAll('[data-option]')];
    for (const choice of choices) choice.disabled = false;
    choices[0]?.focus();
  } else {
    root.querySelector('[data-action="bundle"]').focus();
  }
}
