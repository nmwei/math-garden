const { expect, test } = require('@playwright/test');

const viewports = [
  { name: '横屏', width: 1180, height: 820 },
  { name: '竖屏', width: 820, height: 1180 },
];

for (const { name, width, height } of viewports) {
  test(`${name}：从花园闯关页打开游戏列表，退出示范后返回列表`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');

    const button = (label) => page.getByRole('button', { name: label, exact: true });
    const heading = (label) => page.getByRole('heading', { name: label, exact: true });
    const countEntry = button('数一数');

    await page.getByRole('link', { name: '数学游戏' }).click();
    await expect(heading('数学游戏')).toBeVisible();
    await expect(button('图形找朋友')).toBeEnabled();
    await expect(button('接着排一排')).toBeEnabled();
    await countEntry.click();
    await expect(heading('数一数')).toBeVisible();

    const status = page.getByRole('status');
    const initialStatus = await status.textContent();
    for (const index of [1, 2, 3]) {
      const flower = button(`第 ${index} 朵花`);
      await expect(flower).toHaveAttribute('aria-pressed', 'false');
      await flower.click();
      await expect(flower).toHaveAttribute('aria-pressed', 'true');
      await expect(status).not.toHaveText(initialStatus ?? '');
      if (index === 1) {
        await flower.click();
        await expect(status).toHaveText('数到 1 了，再点一朵。');
        await expect(button('3')).toBeHidden();
      }
    }

    for (const number of ['2', '3', '4']) {
      await expect(button(number)).toBeVisible();
    }
    await button('2').click();
    await expect(status).toHaveText('再看看有几朵花，然后选一次。');
    await button('3').click();
    await expect(page.getByText('数对啦，一共有 3 朵花。', { exact: true })).toBeVisible();
    await button('退出游戏').click();
    await expect(heading('数学游戏')).toBeVisible();
    await expect(countEntry).toBeFocused();
  });
}

test('可以重看示范，刷新后记住各游戏的示范状态', async ({ page }) => {
  await page.goto('/#games');
  const button = (name) => page.getByRole('button', { name, exact: true });
  await button('数一数').click();
  await button('跳过示范').click();
  const replay = button('再看示范');
  await expect(replay).toBeVisible();
  await replay.click();
  await expect(button('第 1 朵花')).toHaveAttribute('aria-pressed', 'false');
  await button('退出游戏').click();
  await button('图形找朋友').click();
  await button('退出游戏').click();
  await button('接着排一排').click();
  await button('叶子').click();
  await expect(button('开始练习')).toBeVisible();

  await page.reload();
  for (const name of ['数一数', '接着排一排']) {
    await button(name).click();
    await expect(button('开始练习')).toBeVisible();
    await button('退出游戏').click();
  }
  await button('图形找朋友').click();
  await expect(button('跳过示范')).toBeVisible();
});
