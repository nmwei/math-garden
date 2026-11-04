const gardenShell = (() => {
  const bar = document.querySelector('[data-garden-page]');
  const page = bar.dataset.gardenPage;
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6"/>',
    course: '<path d="M12 5v15m0-15C9 3 6 3 3 4v14c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1z"/>',
    games: '<circle cx="7" cy="7" r="3.5"/><path d="m12 19 4.5-8 4.5 8zM3 13h7v7H3z"/>',
    parent: '<path d="m12 3 8 4v5c0 4-3 7-8 9-5-2-8-5-8-9V7z"/><path d="m9 12 2 2 4-4"/>',
  };
  const icon = (name) => `<svg class="garden-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const items = [
    ['home', page === 'home' ? '#home' : './index.html', '首页'],
    ['course', './course.html', '学习地图'],
    ['games', page === 'home' ? '#games' : './index.html#games', '数学游戏'],
  ];

  bar.innerHTML = `<a class="brand" href="${items[0][1]}">
      <img src="./assets/icon.svg" alt="" width="42" height="42">
      <span><strong>123 小花园</strong><small>MATH GARDEN</small></span>
    </a>
    <nav class="garden-nav" aria-label="主要导航">${items.map(([id, href, label]) =>
      `<a href="${href}" data-garden-nav="${id}">${icon(id)}<span>${label}</span></a>`).join('')}</nav>
    <div class="garden-rail-end">
      <div class="garden-sprout" aria-hidden="true"><span></span><i></i><b></b></div>
      <p class="garden-motto">小小的问题，好多种办法。</p>
      <a class="garden-parent-link" href="./parent.html" data-garden-nav="parent">${icon('parent')}<span>家长小角</span></a>
    </div>`;

  function select(id) {
    for (const link of bar.querySelectorAll('[data-garden-nav]')) {
      if (link.dataset.gardenNav === id) link.setAttribute('aria-current', id === 'games' ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    }
  }

  select(page === 'home' && location.hash === '#games' ? 'games' : page);

  if (page !== 'parent' && typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
    const link = bar.querySelector('.garden-parent-link');
    const dialog = document.createElement('dialog');
    dialog.className = 'garden-parent-dialog';
    dialog.setAttribute('aria-labelledby', 'garden-parent-dialog-title');
    dialog.innerHTML = `<h2 id="garden-parent-dialog-title">家长小角</h2>
      <p>声音、离线下载和应用更新，请交给家长来设置。</p>
      <form method="dialog"><button class="secondary" value="cancel" autofocus>返回</button>
        <a class="primary garden-course-link" href="./parent.html">进入家长中心</a></form>`;
    document.body.append(dialog);
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (!dialog.open) dialog.showModal();
    });
    dialog.addEventListener('close', () => link.focus());
    window.addEventListener('pagehide', () => { if (dialog.open) dialog.close(); });
  }

  return { select };
})();
