const { expect, test } = require('@playwright/test');

test('数数选项换序，重试和求助保留顺序，完成后可以换游戏', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.goto('/#games');
  const button = (name) => page.getByRole('button', { name, exact: true });
  const flowers = page.getByRole('button', { name: /^第 \d 朵花$/ });
  const answers = page.getByRole('group', { name: '选一选总数' });
  const answer = (number) => answers.getByRole('button', { name: String(number), exact: true });
  const start = button('数一数');

  await start.click();
  await button('跳过示范').click();
  await button('开始练习').click();

  for (const [index, amount] of [1, 3, 5].entries()) {
    await expect(page.getByText(`第 ${index + 1} / 3 题`, { exact: true })).toBeVisible();
    await expect(flowers).toHaveCount(amount);
    await expect(answers).toBeHidden();

    if (amount === 5) {
      await flowers.last().click();
      await button('帮帮我').click();
      await expect(flowers.last()).toHaveAttribute('aria-pressed', 'false');
    } else {
      for (const flower of await flowers.all()) await flower.click();
    }

    await expect(answers).toBeVisible();
    await expect(answers.getByRole('button')).toHaveCount(3);
    if (amount === 1) {
      const choices = answers.getByRole('button');
      await expect(choices).toHaveText(['3', '2', '1']);
      await answer(2).click();
      await expect(answer(2)).toHaveClass(/\bis-retry\b/);
      await expect(button('下一题')).toBeHidden();
      await expect(choices).toHaveText(['3', '2', '1']);
      await button('帮帮我').click();
      await expect(choices).toHaveText(['3', '2', '1']);
    }

    const next = button(amount === 5 ? '回游戏列表' : '下一题');
    await expect(next).toBeHidden();
    await answer(amount).click();
    await next.click();
  }

  await expect(page.getByRole('status')).toHaveText('三题都完成啦！');
  await expect(start).toBeFocused();
  await start.click();
  await button('开始练习').click();
  await expect(page.getByText('第 1 / 3 题', { exact: true })).toBeVisible();
  await expect(flowers).toHaveCount(2);
  await button('退出游戏').click();
  await expect(start).toBeFocused();
});

test('报数随有效点按触发，返回会停止帮助', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    window.spoken = [];
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        getVoices: () => [],
        speak: ({ text, lang }) => window.spoken.push([text, lang]),
        cancel: () => window.spoken.push('停止'),
      },
    });
  });
  await page.goto('/#games');
  const button = (name) => page.getByRole('button', { name, exact: true });
  const spokenNumbers = () => page.evaluate(() => window.spoken.filter(Array.isArray));
  await button('数一数').click();
  await button('跳过示范').click();
  await button('开始练习').click();
  await button('第 1 朵花').click();
  await button('第 1 朵花').click();
  expect(await spokenNumbers()).toEqual([['一', 'zh-CN']]);
  await button('1').click();
  await button('下一题').click();
  await button('帮帮我').click();
  await expect(page.getByRole('status')).toHaveText('一起数，1。');
  await button('退出游戏').click();
  await page.clock.runFor(2500);
  expect(await spokenNumbers()).toEqual([['一', 'zh-CN'], ['一', 'zh-CN']]);
  expect(await page.evaluate(() => window.spoken.at(-1))).toBe('停止');
});
