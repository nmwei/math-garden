const { expect, test } = require('@playwright/test');

const link = (page, name) => page.getByRole('link', { name, exact: true });
const button = (page, name) => page.getByRole('button', { name, exact: true });
const heading = (page, name) => page.getByRole('heading', { name, exact: true });

test('从花园闯关页练完第一课，求助单独计入，刷新后保留进度', async ({ page }) => {
  await page.goto('/');
  await expect(heading(page, '今天学什么')).toBeVisible();
  await expect(page.getByText('看见几朵花', { exact: true })).toBeVisible();
  await link(page, '试一节').click();
  await expect(page).toHaveURL(/#course\/practice\/notice-small$/);
  await expect(heading(page, '看见几朵花')).toBeVisible();

  await button(page, '1').click();
  await button(page, '下一题').click();
  await button(page, '看提示').click();
  await expect(page.getByText('从一边点到另一边，一朵花只点一次。')).toBeVisible();
  await button(page, '3').click();
  await button(page, '下一题').click();
  await button(page, '2').click();
  await button(page, '看练习结果').click();
  await expect(heading(page, '这一课练完啦')).toBeVisible();
  await expect(page.getByText('本次首次独立答对 2 / 3 题', { exact: true })).toBeVisible();

  await link(page, '回学习地图').click();
  await page.reload();
  await expect(link(page, '看见几朵花').getByText('已练 · 可复习')).toBeVisible();
  const recommended = link(page, '每朵只数一次');
  await expect(recommended).toHaveAccessibleDescription('推荐');
  await recommended.click();
  await expect(page).toHaveURL(/#course\/lesson\/count-total$/);
  await expect(page.getByText('先看一个例子', { exact: true })).toBeVisible();
  await link(page, '花园闯关').click();
  await expect(page.getByRole('region', { name: '今天学什么' }).getByText('每朵只数一次', { exact: true })).toBeVisible();
  await expect(link(page, '练这一课')).toHaveAttribute('href', /#course\/practice\/count-total$/);
});

test('可以跨学段浏览，设备没有语音也能摆花和修改', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined });
  });
  await page.goto('/#course');
  for (const stage of ['零基础', '一年级', '二年级', '三年级']) {
    await expect(link(page, stage)).toBeVisible();
  }
  await link(page, '一年级').click();
  await expect(link(page, '认识 0～10')).toHaveAccessibleDescription('推荐');
  await link(page, '零基础').click();
  await expect(link(page, '看见几朵花')).toHaveAccessibleDescription('推荐');
  await link(page, '照着数字摆花').click();
  await button(page, '开始练习').click();

  const second = button(page, '第 2 格');
  await expect(second.locator('img')).toBeHidden();
  for (const slot of ['第 1 格', '第 2 格', '第 3 格']) await button(page, slot).click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await expect(second.locator('img')).toBeVisible();
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'false');
  await button(page, '放好了').click();
  await expect(button(page, '下一题')).toBeHidden();
  await second.click();
  await button(page, '放好了').click();
  await expect(button(page, '下一题')).toBeVisible();
});
