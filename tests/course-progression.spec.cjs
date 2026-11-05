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
  await link(page, '启蒙').click();
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

test('生活小点子只在相应课后显示为一行文字', async ({ page }) => {
  await page.goto('/#course/grade-1');
  await expect(page.getByText('在家试一试', { exact: true })).toHaveCount(0);
  await link(page, '在 10 的小站停一下').click();
  await button(page, '开始练习').click();
  await button(page, '第 9 格').click();
  await button(page, '第 10 格').click();
  await button(page, '放好了').click();
  await button(page, '下一题').click();
  await button(page, '数轴上的 8').click();
  await button(page, '下一题').click();
  await button(page, '7').click();
  await button(page, '下一题').click();
  await button(page, '12').click();
  await button(page, '下一题').click();
  await button(page, '2').click();
  await button(page, '看练习结果').click();

  await expect(link(page, '去下一课')).toBeVisible();
  const tip = page.getByText('吃水果时，可以拿 8 颗葡萄，看看还差几颗到 10。', { exact: true });
  await expect(tip).toBeVisible();
  await expect(tip).toHaveJSProperty('tagName', 'P');
  await expect(page.getByText('在家试一试', { exact: true })).toHaveCount(0);
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
  await button(page, '下一题').click();
  await button(page, '4').click();
  await button(page, '下一题').click();
  await button(page, '4').click();
  await button(page, '看练习结果').click();
  await expect(heading(page, '这一课练完啦')).toBeVisible();
  await expect(page.locator('.course-home-tip')).toHaveCount(0);
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

test('重练会换题，新课的间隔复习也有独立题目', async ({ page }) => {
  await page.goto('/#course/lesson/g3-measure-capacity');
  await button(page, '开始练习').click();
  const firstPrompt = await page.locator('.course-readout-line > p').first().textContent();
  await page.evaluate(() => {
    writeCourseMemory('math-garden:course:g3-measure-capacity', { independent: 5, total: 5, attempts: 1 });
    writeCourseMemory('math-garden:review:g3-measure-capacity', { streak: 1, reviewOn: '2026-11-05', practiceOn: '2026-11-04', variant: 1 });
  });
  await page.reload();
  await button(page, '开始练习').click();
  await expect(page.getByText('第 1 / 5 题', { exact: true })).toBeVisible();
  await expect(page.locator('.course-readout-line > p').first()).not.toHaveText(firstPrompt);
  await page.clock.setFixedTime(new Date(2026, 10, 5, 12));
  await page.goto('/#course/grade-3');
  await link(page, '复习 · 量一量，能装多少水').click();
  await expect(page.getByText('第 1 / 3 题', { exact: true })).toBeVisible();
  await expect(page.getByText('水壶能装 1 升，水瓶能装 750 毫升。水壶多装多少毫升？')).toBeVisible();
  await button(page, '250').click();
  await expect(page.locator('.course-status').getByText('答对啦！', { exact: true })).toBeVisible();
});

test('全部课程首练与重练各有五道有效题，复习至少带一道新题', async ({ page }) => {
  await page.goto('/#course');
  const failures = await page.evaluate(() => {
    const key = question => JSON.stringify([question.prompt, question.model, question.build, question.line]);
    const errors = [];
    for (const lesson of courseLessons) {
      const first = makeCoursePractice(lesson);
      const firstKeys = new Set(first.map(key));
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const practice = makeCoursePractice(lesson, attempt);
        const practiceKeys = new Set(practice.map(key));
        const review = makeCourseReview(lesson, attempt, attempt);
        if (practiceKeys.size !== 5 || practice.length !== 5) errors.push(`${lesson.id}: 练习数量不正确`);
        if (attempt === 1 && practice.every(question => firstKeys.has(key(question)))) errors.push(`${lesson.id}: 重练没有换题`);
        if (review.length !== 3 || review.every(question => practiceKeys.has(key(question)))) errors.push(`${lesson.id}: 复习没有换题`);
        for (const item of [...practice, ...review]) {
          if (item.choices && (!item.choices.includes(item.answer) || new Set(item.choices).size !== item.choices.length)) {
            errors.push(`${lesson.id}: 选择题缺答案或有重复选项`);
          }
          if (item.build && (item.answer < 0 || item.answer > item.build.max - (item.build.fixed ?? 0))) {
            errors.push(`${lesson.id}: 摆放题无法摆出答案`);
          }
          if (item.line && (item.answer < item.line.min || item.answer > item.line.max)) {
            errors.push(`${lesson.id}: 数轴上没有答案`);
          }
        }
      }
    }
    return errors;
  });
  expect(failures).toEqual([]);
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
