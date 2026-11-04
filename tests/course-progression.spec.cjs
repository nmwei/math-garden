const { expect, test } = require('@playwright/test');

const link = (page, name) => page.getByRole('link', { name, exact: true });
const button = (page, name) => page.getByRole('button', { name, exact: true });
const heading = (page, name) => page.getByRole('heading', { name, exact: true });

test('小任务找到合适的学习起点，保留早期课程的未练状态', async ({ page }) => {
  await page.goto('/#course/start-check');
  await button(page, '开始找起点').click();
  await button(page, '7').click();
  for (let slot = 1; slot <= 6; slot += 1) await button(page, `第 ${slot} 格`).click();
  await button(page, '放好了').click();
  await button(page, '还不确定').click();
  await button(page, '5').click();
  await button(page, '40').click();
  await button(page, '24').click();

  await expect(heading(page, '建议先学「找回缺的一部分」')).toBeVisible();
  await expect(page.getByText('第 3 题是「想想还差几个到 10」。这题还不确定，可以先从这里练起。')).toBeVisible();
  await expect(link(page, '去试这一课')).toHaveAttribute('href', '#course/lesson/bridge-missing-part');
  await link(page, '回学习地图').click();
  await page.reload();
  await expect(link(page, '找回缺的一部分')).toHaveAccessibleDescription('推荐');
  await link(page, '零基础').click();
  await expect(link(page, '看见几朵花').getByText('可以开始', { exact: true })).toBeVisible();
});

for (const { first, retry, title, destination, reason } of [
  { first: '6', retry: '5', title: '每朵只数一次', destination: 'count-total', reason: /换一道同类题后，答案还是没有对上/ },
  { first: '6', retry: '6', title: '在 10 的小站停一下', destination: 'bridge-cross-ten', reason: /换题后也答对了/ },
  { first: '7', title: '在 10 的小站停一下', destination: 'bridge-cross-ten', reason: /这 6 个小任务都做对了/ },
]) {
  test(`后五题全对，首题答 ${first}${retry ? `、复核答 ${retry}` : ''} 时推荐「${title}」`, async ({ page }) => {
    await page.goto('/#course/start-check');
    await button(page, '开始找起点').click();
    await button(page, first).click();
    if (retry) {
      await expect(page.getByText('第 1 / 6 题 · 换一题再试', { exact: true })).toBeVisible();
      await expect(page.getByText('再数数这边，一共有几朵花？', { exact: true })).toBeVisible();
      await button(page, retry).click();
    }
    for (let slot = 1; slot <= 6; slot += 1) await button(page, `第 ${slot} 格`).click();
    await button(page, '放好了').click();
    for (const answer of ['4', '5', '40', '24']) await button(page, answer).click();

    await expect(heading(page, `建议先学「${title}」`)).toBeVisible();
    await expect(link(page, '去试这一课')).toHaveAttribute('href', `#course/lesson/${destination}`);
    await expect(page.getByText(reason)).toBeVisible();
  });
}

test('在家活动同一天固定，隔天重新展开就会换一条', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 3, 12));
  await page.goto('/#course/foundation');
  const details = page.locator('.course-home-task');
  const summary = details.locator('summary');
  const task = details.locator('p');
  await summary.click();
  const first = await task.textContent();
  await page.reload();
  await summary.click();
  await expect(task).toHaveText(first);

  const displayed = new Set([first]);
  for (let day = 4; day <= 9; day++) {
    await summary.click();
    await expect(task).toBeHidden();
    await page.clock.setFixedTime(new Date(2026, 10, day, 12));
    const previous = await task.textContent();
    await summary.click();
    await expect(task).not.toHaveText(previous);
    if (day <= 8) displayed.add(await task.textContent());
  }
  expect(displayed.size).toBe(6);
  await link(page, '一年级').click();
  await expect(details).toHaveAttribute('data-home-stage', 'grade-1');
  await summary.click();
  expect(displayed.has(await task.textContent())).toBe(false);
});

test('完成一课后隔日出现复习，复习采用另一组题', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 4, 12));
  await page.goto('/#course/lesson/count-total');
  await button(page, '开始练习').click();
  await button(page, '5').click();
  await button(page, '下一题').click();
  await button(page, '4').click();
  await button(page, '下一题').click();
  await button(page, '5').click();
  await button(page, '看练习结果').click();
  await expect(heading(page, '这一课练完啦')).toBeVisible();
  await link(page, '回学习地图').click();
  await expect(heading(page, '今日复习')).toBeHidden();

  await page.clock.setFixedTime(new Date(2026, 10, 5, 12));
  await page.reload();
  await expect(heading(page, '今日复习')).toBeVisible();
  await expect(link(page, '复习 · 每朵只数一次')).toBeVisible();
  await link(page, '花园闯关').click();
  await expect(page.getByRole('region', { name: '今天学什么' }).getByText('每朵只数一次', { exact: true })).toBeVisible();
  await expect(link(page, '练这一课')).toBeHidden();
  await link(page, '复习一下').click();
  await expect(page).toHaveURL(/#course\/review\/count-total$/);
  await expect(page.getByText('小花藏在几排里，一共有几朵？', { exact: true })).toBeVisible();
});

test('十个一捆保留总数量，捆完后孩子自己读出几捆几根', async ({ page }) => {
  await page.goto('/#course/lesson/bridge-bundle-ten');
  await button(page, '开始练习').click();

  const bundle = button(page, '把 10 根捆一捆');
  const answer = button(page, '2 捆，剩 6 根');
  await expect(answer).toBeDisabled();
  await bundle.click();
  await expect(page.getByRole('img', { name: '16 根散棒', exact: true })).toBeVisible();
  await bundle.click();
  await expect(page.getByRole('group', { name: '2 捆，每捆十根', exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: '6 根散棒', exact: true })).toBeVisible();
  await expect(bundle).toBeHidden();
  await expect(answer).toBeEnabled();
  await answer.click();
  await expect(button(page, '下一题')).toBeVisible();
});
