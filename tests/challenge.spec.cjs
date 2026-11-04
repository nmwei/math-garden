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
  await link(page, '回闯关再试').click();

  await expect(heading(page, '把两组花合起来')).toBeVisible();
  await expect(page.getByRole('group', { name: '第 1 组，5 朵花' })).toBeVisible();
  await button(page, '9').click();
  await button(page, '还不确定').click();
  await expect(page.getByText('本关完成 1 / 4 个挑战')).toBeVisible();
  await link(page, '回花园闯关').click();
  await page.reload();
  await expect(numbers.getByText('已完成 3 / 16 站')).toBeVisible();
  await expect(shapes.getByRole('link', { name: '开始闯关' })).toBeVisible();
  await expect(link(page, '查看闯关记录')).toHaveCount(0);
  await expect(page.getByText('换题后做对', { exact: true })).toHaveCount(0);

  await link(page, '家长小角').click();
  await button(page, '长按进入').click({ delay: 1100 });
  await link(page, '查看闯关记录').click();
  await expect(page).toHaveURL('/#parent/records');
  await expect(heading(page, '闯关记录')).toBeFocused();
  for (const title of ['家长中心', '设备声音', '今天学什么', '选一条小路']) {
    await expect(heading(page, title)).toBeHidden();
  }
  await page.reload();
  await expect(page.getByText('换题后做对', { exact: true })).toBeVisible();
  await expect(page.getByText('还不确定', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /^还没测 · 去测/ }).first()).toBeVisible();
  await link(page, '返回家长中心').click();
  await expect(heading(page, '家长中心')).toBeVisible();
  await expect(link(page, '查看闯关记录')).toBeFocused();
});

test('家长可单独测后面的技能，正常闯关会先补前面的站', async ({ page }) => {
  await page.goto('/');
  await link(page, '家长小角').click();
  await button(page, '长按进入').click({ delay: 1100 });
  await link(page, '查看闯关记录').click();
  await link(page, '还没测 · 去测「接着排重复的小组」').click();
  await expect(heading(page, '接着排重复的小组')).toBeVisible();
  await button(page, '三角形').click();
  await expect(heading(page, '这项测完啦')).toBeVisible();
  await expect(page.getByText('这条小路已完成 1 / 9 站')).toBeVisible();
  await link(page, '完成，回到记录').click();
  const shapeRecords = page.getByRole('region', { name: '图形与规律' });
  await expect(shapeRecords.getByRole('listitem').filter({ hasText: '接着排重复的小组' })).toContainText('独立做对');
  await expect(link(page, '还没测 · 去测「用直边认图形」')).toBeVisible();

  await link(page, '花园闯关').click();
  const shapePath = page.getByRole('article', { name: '图形与规律' });
  await expect(shapePath.getByText('已完成 1 / 9 站')).toBeVisible();
  await expect(shapePath.getByText('第 1 站 · 用直边认图形')).toBeVisible();
  await shapePath.getByRole('link', { name: '继续闯关' }).click();
  await expect(heading(page, '用直边认图形')).toBeVisible();
  await button(page, '三角形').click();
  await expect(heading(page, '区分平面和立体图形')).toBeVisible();
});
