function courseText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

function courseCells(count, draw) {
  return Array.from({ length: count }, (_, index) => draw(index)).join('');
}

function flowerDot(index, interactive) {
  const art = '<img src="./assets/count-flower.svg" alt="" width="36" height="36">';
  return interactive
    ? `<button class="course-dot" type="button" data-dot aria-label="第 ${index + 1} 朵花" aria-pressed="false">${art}</button>`
    : `<span class="course-dot" aria-hidden="true">${art}</span>`;
}

function renderCourseModel(model, interactive = false) {
  if (!model) return '';
  switch (model.kind) {
    case 'dots': {
      const canTouch = interactive && model.touch;
      let index = 0;
      return `<div class="course-dot-groups${model.stagger ? ' course-stagger' : ''}">${model.groups.map((count, group) =>
        `<div class="course-dot-row" role="group" aria-label="第 ${group + 1} 组${canTouch ? '' : `，${count} 朵花`}">
          ${courseCells(count, () => flowerDot(index++, canTouch)) || '<span class="course-empty">空花坛</span>'}
        </div>`).join('')}</div>`;
    }
    case 'frame': {
      const added = model.added ?? 0;
      const frame = `<div class="course-frame" role="img" aria-label="十格框，已有 ${model.filled} 格${added ? `，再填 ${added} 格` : ''}">
        ${courseCells(10, index => `<span class="${index < model.filled ? 'filled' : index < model.filled + added ? 'added' : ''}"></span>`)}
      </div>`;
      return model.overflow
        ? `<div class="course-frame-model">${frame}<div class="course-dot-row" role="group" aria-label="框外还有 ${model.overflow} 朵花">${courseCells(model.overflow, index => flowerDot(index, false))}</div></div>`
        : frame;
    }
    case 'tape':
      return `<div class="course-tape" role="img" aria-label="总数 ${model.total}，其中两部分为 ${courseText(model.parts.map(part => part.label).join(' 和 '))}">
        <span class="course-tape-total">一共 ${model.total}</span>
        <div>${model.parts.map(part => `<span style="--part:${part.size}"${part.label === '?' ? ' class="course-tape-unknown"' : ''}>${courseText(part.label)}</span>`).join('')}</div>
      </div>`;
    case 'line': {
      const { min, max, marks = [], jump } = model;
      const length = max - min;
      const ticks = length <= 12 ? Array.from({ length: length + 1 }, (_, index) => min + index)
        : [...new Set([min, Math.round((min + max) / 2), max, ...marks, ...(jump ?? [])])];
      const position = value => (value - min) / length * 100;
      return `<div class="course-numberline" role="img" aria-label="${min} 到 ${max} 的数轴${marks.length ? `，标出 ${marks.join('、')}` : ''}${jump ? `，从 ${jump[0]} 跳到 ${jump[1]}` : ''}">
        ${jump ? `<i class="course-jump" style="--from:${Math.min(...jump.map(position))}%;--span:${Math.abs(position(jump[1]) - position(jump[0]))}%">${jump[1] > jump[0] ? '→' : '←'}</i>` : ''}
        ${ticks.map(value => `<span style="--at:${position(value)}%" class="${marks.includes(value) ? 'marked' : ''}">${value}</span>`).join('')}
      </div>`;
    }
    case 'place':
      return `<div class="course-place" role="img" aria-label="${model.digits.map((digit, index) => `${digit} 个${courseText(model.labels[index])}`).join('，')}">
        ${model.digits.map((digit, index) => `<span><small>${courseText(model.labels[index] === '一' ? '个' : model.labels[index])}位</small><strong>${digit}</strong></span>`).join('')}
      </div>`;
    case 'grid':
    case 'array':
      return `<div class="course-grid ${model.outline ? 'outline' : ''}" style="--columns:${model.cols}" role="img" aria-label="${model.rows} 行，每行 ${model.cols} 格">
        ${courseCells(model.rows * model.cols, () => '<span></span>')}
      </div>`;
    case 'bars':
      return `<div class="course-bars" role="img" aria-label="${courseText(model.items.map(([label, value]) => `${label} ${value}`).join('，'))}">
        ${model.items.map(([label, value]) => `<div><b>${courseText(label)}</b><span>${courseCells(value, () => '<i></i>')}</span></div>`).join('')}
      </div>`;
    case 'tally':
      return `<p class="course-model-text" role="img" aria-label="${courseText(model.items.map(([label, value]) => `${label} ${value} 笔`).join('，'))}">
        ${model.items.map(([label, value]) => `${courseText(label)}　${'│'.repeat(value)}`).join('　　')}
      </p>`;
    case 'fraction':
      return `<div class="course-fraction" role="img" aria-label="平均分成 ${model.parts} 份，涂了 ${model.filled} 份">
        ${courseCells(model.parts, index => `<span class="${index < model.filled ? 'filled' : ''}"></span>`)}
      </div>`;
    case 'shapes':
      return `<div class="course-shapes">${model.items.map(courseShape).join('')}</div>`;
    case 'shape-puzzle': {
      const { layout } = model;
      const figures = {
        diagonal: ['正方形，从左上角到右下角画了一条分割线', 80, 80, 'M15 15L65 65'],
        sideBySide: ['图形沿竖着的虚线分成两块，每块都有四个直角、四条一样长的边', 130, 80, 'M65 15V65'],
        stacked: ['外边有四个直角，两条竖边比横边长，中间有一条横着的虚线', 80, 130, 'M15 65H65'],
      };
      const [label, width, height, seam] = figures[layout];
      return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}">
        <rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="var(--course-green)" fill-opacity=".45" stroke="currentColor" stroke-width="2"/>
        <path d="${seam}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/>
      </svg>`;
    }
    case 'clock':
      return courseClock(model);
    case 'text':
      return `<p class="course-model-text">${courseText(model.text)}</p>`;
    default:
      return '';
  }
}

function courseShape(shape) {
  const figures = {
    circle: ['圆形', '<circle cx="40" cy="40" r="28"/>'],
    triangle: ['三角形', '<path d="M40 12 70 66H10Z"/>'],
    square: ['正方形', '<rect x="15" y="15" width="50" height="50"/>'],
    rectangle: ['长方形', '<rect x="9" y="22" width="62" height="36"/>'],
    cube: ['正方体', '<path d="M14 25 29 12H66V52L51 66H14Z M14 25H51V66 M51 25 66 12"/>'],
    cylinder: ['圆柱', '<path d="M18 22V58a22 10 0 0 0 44 0V22"/><ellipse cx="40" cy="22" rx="22" ry="10"/>'],
    sphere: ['球', '<circle cx="40" cy="40" r="28"/><ellipse cx="40" cy="40" rx="28" ry="9" fill="none"/>'],
  };
  const figure = figures[shape];
  if (!figure) return '';
  return `<svg viewBox="0 0 80 80" role="img" aria-label="${figure[0]}">${figure[1]}</svg>`;
}

function courseClock({ hour, minute }) {
  const shortHand = minute ? `在 ${hour} 和 ${hour % 12 + 1} 之间` : `指向 ${hour}`;
  const longHand = minute % 5 === 0 ? `指向 ${minute / 5 || 12}` : `在 ${Math.floor(minute / 5) || 12} 之后 ${minute % 5} 小格`;
  return `<svg class="course-clock" viewBox="0 0 120 120" role="img" aria-label="钟面，短针${shortHand}，长针${longHand}">
    <circle cx="60" cy="60" r="54"/>
    ${courseCells(60, index => `<path d="M60 10v${index % 5 === 0 ? 5 : 2}" transform="rotate(${index * 6} 60 60)"/>`)}
    ${courseCells(12, index => {
      const angle = index * Math.PI / 6;
      return `<text x="${60 + 37 * Math.sin(angle)}" y="${64 - 37 * Math.cos(angle)}">${index || 12}</text>`;
    })}
    <path class="hour" d="M60 61V36" transform="rotate(${(hour % 12 + minute / 60) * 30} 60 60)"/>
    <path class="minute" d="M60 61V28" transform="rotate(${minute * 6} 60 60)"/>
    <circle cx="60" cy="60" r="3" class="clock-pin"/>
  </svg>`;
}
