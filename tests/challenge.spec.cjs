const { expect, test } = require('@playwright/test');

const button = (page, name) => page.getByRole('button', { name, exact: true });
const link = (page, name) => page.getByRole('link', { name, exact: true });
const heading = (page, name) => page.getByRole('heading', { name, exact: true });

test('闯关分路线记录，同类题复核后推荐课程，练完可换题回测', async ({ page }) => {
  await page.goto('/');
  const numbers = page.getByRole('article', { name: '数与计算' });
  const shapes = page.getByRole('article', { name: '图形与规律' });
  await expect(heading(page, '花园闯关')).toBeVisible();
  await expect(shapes).toBeVisible();
  await expect(page.getByRole('article', { name: '测量与数据' })).toBeVisible();
  await expect(button(page, '数一数')).toBeHidden();
  await numbers.getByRole('link', { name: '开始闯关' }).click();

  await expect(heading(page, '数出一共有多少')).toBeVisible();
  await button(page, '6').click();
  await expect(page.getByText('换一道同类题，再试试。')).toBeVisible();
  await button(page, '4').click();
  for (let slot = 1; slot <= 6; slot += 1) await button(page, `第 ${slot} 格`).click();
  await button(page, '放好了').click();

  await button(page, '6').click();
  await button(page, '10').click();
  await expect(heading(page, '找到下一步啦')).toBeVisible();
  await expect(page.getByText('本关完成 2 / 4 个挑战')).toBeVisible();
  await expect(page.getByText('换题后做对', { exact: true })).toBeVisible();
  await expect(link(page, '去练这一课')).toHaveAttribute('href', '#course/lesson/parts-and-whole/number/parts-and-whole');
  await link(page, '去练这一课').click();
  await expect(heading(page, '两堆花合起来')).toBeVisible();
  await button(page, '开始练习').click();
  await button(page, '4').click();
  await button(page, '下一题').click();
  await button(page, '3').click();
  await button(page, '下一题').click();
  await button(page, '第 1 格').click();
  await button(page, '第 2 格').click();
  await button(page, '放好了').click();
  await button(page, '看练习结果').click();
  await link(page, '回这一站再试').click();

  await expect(page).toHaveURL('/#course/challenge/number/parts-and-whole');
  await expect(heading(page, '把两组花合起来')).toBeVisible();
  await expect(page.getByRole('group', { name: '第 1 组，5 朵花' })).toBeVisible();
  await button(page, '9').click();
  await expect(page.getByText('本关完成 1 / 1 个挑战')).toBeVisible();
  await link(page, '完成，回路线').click();
  await page.reload();
  const first = page.locator('details').filter({ hasText: '数出一共有多少' });
  await expect(first).toContainText('换题后做对');
  await first.locator('summary').click();
  await expect(link(first, '看对应课程')).toHaveAttribute('href', '#course/lesson/count-total/number/count-total');
  await link(first, '再玩一次').click();
  await expect(heading(page, '数出一共有多少')).toBeVisible();
  await expect(page.locator('[data-dot]')).toHaveCount(3);
  await button(page, '还不确定').click();
  await expect(page.getByText('这条小路已完成 3 / 16 站')).toBeVisible();
  await link(page, '回路线').click();
  await expect(first).toContainText('换题后做对');
  await expect(first).toHaveAttribute('open');
  await link(first, '再玩一次').click();
  await expect(page.locator('[data-dot]')).toHaveCount(5);
  await link(page, '回路线').click();
  await link(page, '回花园闯关').click();
  await expect(numbers.getByText('已完成 3 / 16 站')).toBeVisible();
});

test('后面的站可以先看对应课程，已有的跨站记录仍可回练', async ({ page }) => {
  await page.goto('/');
  const shapes = page.getByRole('article', { name: '图形与规律' });
  await link(shapes, '看路线').click();
  const station = page.locator('details').filter({ hasText: '接着排重复的小组' });
  await station.locator('summary').click();
  await expect(station).toContainText('待挑战');
  await expect(station.getByRole('link')).toHaveCount(1);
  await link(station, '看对应课程').click();
  await expect(heading(page, '找出重复的小组')).toBeVisible();
  await link(page, '回路线').click();
  await expect(station).toHaveAttribute('open');
  await page.goto('/#course/challenge/shape/repeat-unit');
  await expect(heading(page, '图形与规律')).toBeVisible();
  await expect(heading(page, '接着排重复的小组')).toBeHidden();

  await page.evaluate(() => {
    localStorage.setItem('math-garden:challenge:v1:shape:repeat-unit', JSON.stringify({ attempts: 1, outcome: 'independent' }));
  });
  await page.reload();
  await expect(heading(page, '接着排重复的小组')).toBeVisible();
  await link(page, '回路线').click();
  await expect(station).toContainText('独立做对');
  await expect(link(station, '再玩一次')).toBeVisible();
  await link(page, '回花园闯关').click();
  await link(page, '家长小角').click();
  await button(page, '长按进入').click({ delay: 1100 });
  await expect(heading(page, '家长中心')).toBeVisible();
  await expect(link(page, '查看闯关记录')).toHaveCount(0);

  await link(page, '花园闯关').click();
  await expect(shapes.getByText('已完成 1 / 9 站')).toBeVisible();
  await expect(shapes.getByText('第 1 站 · 用直边认图形')).toBeVisible();
  await link(shapes, '继续闯关').click();
  await expect(heading(page, '用直边认图形')).toBeVisible();
  await button(page, '三角形').click();
  await expect(heading(page, '区分平面和立体图形')).toBeVisible();
});
