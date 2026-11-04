const { expect, test } = require('@playwright/test');

const button = (page, name) => page.getByRole('button', { name, exact: true });

test('图形练习可以重试，用提示认识旋转后的图形', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('/#games');
  const start = button(page, '图形找朋友');
  await start.click();
  await button(page, '跳过示范').click();
  await button(page, '开始练习').click();

  await expect(page.getByRole('img', { name: '圆形的轮廓' })).toBeVisible();
  const choices = page.getByRole('group', { name: '选一选' }).getByRole('button');
  const order = ['正方形', '三角形', '圆形'];
  const choiceNames = () => choices.evaluateAll(items => items.map(item => item.getAttribute('aria-label')));
  expect(await choiceNames()).toEqual(order);
  await button(page, '三角形').click();
  await expect(button(page, '三角形')).toHaveClass(/\bis-retry\b/);
  await expect(page.getByRole('status')).toHaveText('再看一看，选一次吧。');
  await button(page, '帮帮我').click();
  expect(await choiceNames()).toEqual(order);
  await expect(button(page, '三角形')).toHaveClass(/\bis-retry\b/);
  await button(page, '圆形').click();
  await expect(page.getByRole('img', { name: '圆形找到座位了' })).toBeVisible();
  await button(page, '下一题').click();

  const triangle = button(page, '三角形');
  await expect(triangle).not.toHaveClass(/\bis-retry\b/);
  await expect(triangle.locator('svg')).toHaveCSS('transform', /^matrix\(-/);
  await button(page, '帮帮我').click();
  await expect(page.getByText('换个样子，还是同一种图形。')).toBeHidden();
  await button(page, '帮帮我').click();
  await expect(page.getByText('换个样子，还是同一种图形。')).toBeVisible();
  await triangle.click();
  await expect(page.getByRole('img', { name: '三角形找到座位了' })).toBeVisible();
  for (const shape of ['正方形', '三角形', '正方形']) {
    await button(page, '下一题').click();
    await button(page, shape).click();
  }
  await button(page, '回游戏列表').click();
  await expect(page.getByRole('status')).toHaveText('这一轮完成啦！');
  await expect(start).toBeFocused();
});

test('花叶小路有两组完整规律，再玩一局会练到三格一组', async ({ page }) => {
  await page.goto('/#games');
  const start = button(page, '接着排一排');
  const path = page.getByRole('group', { name: '花叶小路' });
  const steps = () => path.getByRole('img').evaluateAll(items => items.map(item => item.getAttribute('aria-label').split('：')[1]));
  const flower = '花朵';
  const leaf = '叶子';
  await start.click();
  await button(page, '跳过示范').click();
  await button(page, '开始练习').click();

  await expect.poll(steps).toEqual([flower, leaf, flower, leaf, '空格']);
  await button(page, leaf).click();
  await expect(button(page, leaf)).toHaveClass(/\bis-retry\b/);
  await button(page, '帮帮我').click();
  await expect(path.locator('.pattern-unit--complete').first()).toHaveCSS('outline-style', 'dashed');
  await button(page, flower).click();
  await expect.poll(steps).toEqual([flower, leaf, flower, leaf, flower]);
  for (const symbol of [leaf, leaf, flower, leaf]) {
    await button(page, '下一题').click();
    await button(page, symbol).click();
  }
  await button(page, '回游戏列表').click();
  await expect(page.getByRole('status')).toHaveText('这一轮完成啦！');
  await expect(start).toBeFocused();
  await start.click();
  await button(page, '开始练习').click();
  await expect.poll(steps).toEqual([flower, flower, leaf, flower, flower, leaf, flower, flower, '空格']);
  await button(page, leaf).click();
  await button(page, '下一题').click();
  await expect.poll(steps).toEqual([flower, leaf, leaf, flower, leaf, leaf, flower, '空格']);
  await button(page, leaf).click();
  await button(page, '下一题').click();
  await button(page, flower).click();
  await button(page, '下一题').click();
  await expect(button(page, '果子')).toBeVisible();
  await button(page, '退出游戏').click();
  await expect(start).toBeFocused();
});

test('五项游戏都能重听当前题目', async ({ page }) => {
  await page.addInitScript(() => {
    window.spoken = [];
    Object.defineProperty(window, 'speechSynthesis', {
      value: { getVoices: () => [], speak: ({ text }) => window.spoken.push(text), cancel: () => {} },
    });
  });
  await page.goto('/#games');
  const hear = async (prompt) => {
    await button(page, '听题目').click();
    expect(await page.evaluate(() => window.spoken.at(-1))).toBe(prompt);
  };

  await button(page, '数一数').click();
  await hear('点一朵花，数一个数。');
  for (const flower of await page.getByRole('button', { name: /^第 \d 朵花$/ }).all()) await flower.click();
  await hear('一共有几朵花？');
  await button(page, '退出游戏').click();
  await button(page, '图形找朋友').click();
  await hear('看一看这个座位，哪个图形能坐进去？');
  await button(page, '退出游戏').click();
  await button(page, '接着排一排').click();
  await hear('花朵、叶子、花朵、叶子、花朵。下一格放什么？');
  await button(page, '退出游戏').click();
  await button(page, '哪边更多').click();
  await hear('比一比，哪边的花更多？也可能一样多。');
  await button(page, '退出游戏').click();
  await button(page, '凑满花坛').click();
  await hear('花坛有 5 格。还要添几朵花才会填满？');
});

test('比多少先看数量，间距不同时可用提示一一对齐', async ({ page }) => {
  await page.goto('/#games');
  const start = button(page, '哪边更多');
  await start.click();
  await button(page, '跳过示范').click();
  await button(page, '开始练习').click();

  await button(page, '下面更多').click();
  await expect(page.getByRole('status')).toHaveText('上面有 2 朵，下面有 4 朵。下面的花更多。');
  await expect(page.locator('.number-compare[data-pair-level="2"] [data-extra]')).toHaveCount(2);
  await button(page, '下一题').click();
  await button(page, '上面更多').click();
  await button(page, '下一题').click();

  const top = page.getByRole('img', { name: '上面有 3 朵花' });
  await expect(top).toHaveCSS('display', 'flex');
  await expect(page.getByRole('img', { name: '下面有 3 朵花' })).toBeVisible();
  await button(page, '上面更多').click();
  await expect(button(page, '上面更多')).toHaveClass(/\bis-retry\b/);
  await button(page, '帮帮我').click();
  await expect(top).toHaveCSS('display', 'grid');
  await button(page, '一样多').click();
  await expect(page.getByRole('status')).toHaveText('上面有 3 朵，下面有 3 朵。两边一样多。');
  await button(page, '退出游戏').click();
  await expect(start).toBeFocused();
});

test('先用五格花坛添花，可撤回，完成后接触十格', async ({ page }) => {
  await page.goto('/#games');
  const start = button(page, '凑满花坛');
  await start.click();
  await button(page, '跳过示范').click();
  await button(page, '开始练习').click();

  await expect(page.getByText('第 1 / 5 题', { exact: true })).toBeVisible();
  const lastCell = button(page, '第 5 格，添花');
  await expect(lastCell).toHaveAttribute('aria-pressed', 'false');
  await lastCell.click();
  await expect(lastCell).toHaveAttribute('aria-pressed', 'true');
  await lastCell.click();
  await expect(lastCell).toHaveAttribute('aria-pressed', 'false');
  await button(page, '2').click();
  await expect(button(page, '2')).toHaveClass(/\bis-retry\b/);
  await button(page, '1').click();
  await expect(lastCell).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('原来有 4 朵，再添 1 朵，正好 5 朵。');
  for (const answer of ['2', '3', '4', '0']) {
    await button(page, '下一题').click();
    await button(page, answer).click();
  }
  await expect(page.getByRole('status')).toHaveText('花坛已经满了，不用再添。');
  await button(page, '回游戏列表').click();
  await expect(start).toBeFocused();
  await start.click();
  await button(page, '开始练习').click();
  for (const answer of ['2', '4']) {
    await button(page, answer).click();
    await button(page, '下一题').click();
  }
  await expect(page.getByRole('group', { name: '10 格花坛，原有 8 朵花' })).toBeVisible();
  await expect(button(page, '第 10 格，添花')).toBeVisible();
});
