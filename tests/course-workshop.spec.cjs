const { expect, test } = require('@playwright/test');

const button = (page, name) => page.getByRole('button', { name, exact: true });
const link = (page, name) => page.getByRole('link', { name, exact: true });

test('生活题保留画过的图，选算式、算找零并核对理由', async ({ page }) => {
  await page.goto('/#course/grade-3');
  await link(page, '进数学工坊').click();
  await expect(page.getByRole('heading', { name: '三年级数学工坊' })).toBeVisible();
  await page.getByRole('link', { name: /逛花园小摊/ }).click();
  await expect(page.getByText(/你带了 60 元/)).toBeVisible();

  await button(page, '填到第 3 格').tap();
  await button(page, '填好了').tap();
  await expect(page.getByRole('status')).toContainText('再想一想');
  await button(page, '填到第 4 格').tap();
  await button(page, '填好了').tap();
  await button(page, '下一步').tap();
  await page.getByText('看看前面的做法', { exact: true }).tap();
  await expect(page.getByRole('img', { name: '已标 4' })).toBeVisible();
  await button(page, '4 × 12 + 5').tap();
  await button(page, '下一步').tap();
  await page.getByRole('textbox', { name: '填入答案' }).fill('7');
  await button(page, '确认答案').tap();
  await button(page, '下一步').tap();
  await button(page, '把两样东西的总价和找回的钱相加').tap();
  await button(page, '说说理由').tap();
  await expect(page.getByRole('heading', { name: '说说你的理由' })).toBeVisible();
  const sample = page.getByText(/少买一包就少付 12 元/);
  await expect(sample).toBeHidden();
  await page.getByText('看看一种说法', { exact: true }).tap();
  await expect(sample).toBeVisible();
  await button(page, '完成').tap();
  await expect(page.getByText('完成了 1 个情境，其中 0 个情境每一步都独立答对。')).toBeVisible();
  await expect(link(page, '先算哪一步')).toHaveAttribute('href', '#course/lesson/mixed-stories');

  await page.reload();
  await expect(page.getByText(/装饰石每包/)).toBeVisible();
});

test('同样长的分数纸带对齐，数轴上的点和之前标出的格保留在做法里', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/#course/lesson/g3-fraction-positions');
  await link(page, '试试 · 换个分法，还是一样长').tap();
  const strip = page.getByRole('group', { name: '格子的标记' });
  const top = await page.locator('.course-fraction').boundingBox();
  const bottom = await strip.boundingBox();
  expect(Math.abs(top.x - bottom.x)).toBeLessThan(2);
  expect(Math.abs(top.width - bottom.width)).toBeLessThan(2);

  await button(strip, '第 1 格').tap();
  await button(strip, '第 3 格').tap();
  await button(page, '标好了').tap();
  await expect(page.getByRole('status')).toContainText('再想一想');
  await button(strip, '第 3 格').tap();
  await button(strip, '第 2 格').tap();
  await button(page, '标好了').tap();
  await button(page, '下一步').tap();

  const numberLine = page.getByRole('group', { name: '从 0 到 1，平均分成 4 段' });
  await button(numberLine, '第 2 个分点').tap();
  await expect(page.getByRole('status')).toContainText('2/4');
  await button(page, '下一步').tap();
  await button(page, '正好一半').tap();
  await button(page, '下一步').tap();
  await button(page, '从同一个 0 出发，两个分数到达同一个位置').tap();
  await button(page, '说说理由').tap();
  await page.getByText('看看前面的做法', { exact: true }).tap();
  await expect(page.locator('.workshop-notes [data-filled="true"]')).toHaveCount(2);
  await expect(page.locator('.workshop-notes .workshop-fraction-line')).toContainText('2/4');
});

test('混合复习先选方法，离线做完三个领域且不改动单课复习安排', async ({ page, context }) => {
  const review = { streak: 2, variant: 1, practiceOn: '2020-01-01', reviewOn: '2020-01-03' };
  await page.goto('/#course/workshop');
  await page.evaluate(async record => {
    await navigator.serviceWorker.ready;
    localStorage.setItem('math-garden:review:read-data', JSON.stringify(record));
    localStorage.setItem('math-garden:course:read-data', JSON.stringify({ total: 5, independent: 5 }));
  }, review);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await link(page, '开始混合复习').click();
  await expect(page.getByText('开始前，你会先用哪种办法？')).toBeVisible();
  await expect(page.locator('.workshop-question .course-model')).toBeHidden();

  const round = await page.evaluate(() => makeWorkshopRound('mixed', 0));
  expect(round.map(({ activity }) => activity.id)).toEqual(['garden-stall', 'fraction-shading', 'garden-votes']);
  for (const [taskIndex, { task }] of round.entries()) {
    for (const [stepIndex, item] of task.steps.entries()) {
      if (item.choices) await button(page, String(item.answer)).tap();
      else if (item.marks) {
        const cells = Array.isArray(item.answer) ? item.answer : Array.from({ length: item.answer }, (_, index) => index);
        for (const index of cells) await page.locator(`[data-workshop-mark="${index}"]`).tap();
        await button(page, '标好了').tap();
      } else if (item.build) {
        if (item.model?.kind === 'bars') {
          const rows = page.locator('.workshop-chart-row');
          const shownCell = await rows.first().locator('.workshop-cell').first().boundingBox();
          const drawingCell = await rows.last().locator('.workshop-cell').first().boundingBox();
          expect(drawingCell.x).toBe(shownCell.x);
          expect(drawingCell.width).toBe(shownCell.width);
        }
        await button(page, `填到第 ${item.answer + (item.build.fixed ?? 0)} 格`).tap();
        await button(page, '填好了').tap();
      } else {
        await page.getByRole('textbox', { name: '填入答案' }).fill(String(item.answer));
        await button(page, '确认答案').tap();
      }
      await button(page, stepIndex === task.steps.length - 1 ? '说说理由' : '下一步').tap();
    }
    await button(page, taskIndex === round.length - 1 ? '完成' : '下一道情境题').tap();
  }
  await expect(page.getByText('完成了 3 个情境，其中 3 个情境每一步都独立答对。')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('math-garden:review:read-data')))).toEqual(review);
  expect(await page.evaluate(() => localStorage.getItem('math-garden:workshop:mixed'))).toBe('1');
  await button(page, '换题再试').tap();
  await expect(page.getByText('开始前，你会先用哪种办法？')).toBeVisible();
  await expect(page.getByText(/整条.*当作长度 1/)).toBeVisible();
});

test('工坊重练轮换情境，同一活动再次出现在混合轮时也会换题', async ({ page }) => {
  await page.goto('/#course/workshop');
  const { count, fractionContexts, measurementContexts } = await page.evaluate(() => {
    const rounds = Array.from({ length: 9 }, (_, round) => makeWorkshopRound('mixed', round)).flat();
    return {
      count: workshopLessons.length,
      fractionContexts: new Set(rounds.filter(({ activity }) => activity.id === 'fraction-shading').map(({ task }) => task.context)).size,
      measurementContexts: new Set(rounds.filter(({ activity }) => activity.id === 'garden-visit').map(({ task }) => task.context)).size,
    };
  });
  expect({ count, fractionContexts, measurementContexts }).toEqual({ count: 6, fractionContexts: 3, measurementContexts: 3 });
});
