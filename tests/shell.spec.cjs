const { expect, test } = require('@playwright/test');
const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { extname, resolve, sep } = require('node:path');

const button = (page, name) => page.getByRole('button', { name, exact: true });
const heading = (page, name) => page.getByRole('heading', { name, exact: true });
const navLink = (page, name) => page.locator('.garden-bar').getByRole('link', { name, exact: true });

async function openParent(page) {
  await navLink(page, '家长小角').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '长按进入', exact: true }).click({ delay: 1100 });
  await expect(heading(page, '家长中心')).toBeVisible();
  await expect(page).toHaveURL(/\/#parent$/);
}

test('家长入口显示长按进度，松手和拖离会取消，键盘长按可进入', async ({ page }) => {
  await page.goto('/#parent/records');
  await expect(page).toHaveURL('/');
  await expect(heading(page, '闯关记录')).toBeHidden();
  await page.getByRole('dialog').getByRole('button', { name: '返回', exact: true }).click();
  const entry = navLink(page, '家长小角');
  await entry.click();
  const dialog = page.getByRole('dialog');
  const hold = dialog.getByRole('button', { name: '长按进入', exact: true });
  await expect(hold).toHaveAccessibleDescription('按住 1 秒');
  await expect(dialog.getByText('按住 1 秒', { exact: true })).toBeHidden();
  await hold.click();
  await expect(dialog).toBeVisible();
  await expect(hold).not.toHaveClass(/\bholding\b/);

  const box = await hold.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(hold).toHaveClass(/\bholding\b/);
  await page.mouse.move(box.x - 20, box.y + box.height / 2);
  await expect(hold).not.toHaveClass(/\bholding\b/);
  await page.mouse.up();

  await dialog.getByRole('button', { name: '返回', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(entry).toBeFocused();
  await entry.click();
  await hold.focus();
  await page.keyboard.down('Space');
  await expect(heading(page, '家长中心')).toBeVisible();
  await page.keyboard.up('Space');
});

test('iPad 触控在按钮内滑动仍能长按进入家长小角', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', '使用 Chromium 触控事件模拟');
  await page.setViewportSize({ width: 1376, height: 1032 });
  await page.goto('/');
  await navLink(page, '家长小角').tap();
  const hold = button(page, '长按进入');
  const box = await hold.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await expect(hold).toHaveClass(/\bholding\b/);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 16, y }] });
  await expect(heading(page, '家长中心')).toBeVisible();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
});

test('iPad 横竖屏都可在花园闯关、学习地图、数学游戏和家长区之间切换', async ({ page }) => {
  for (const viewport of [{ width: 1024, height: 768 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(heading(page, '花园闯关')).toBeVisible();
    await expect(navLink(page, '花园闯关')).toHaveAttribute('aria-current', 'page');
    await navLink(page, '学习地图').click();
    await expect(page).toHaveURL('/#course');
    await expect(navLink(page, '学习地图')).toHaveAttribute('aria-current', 'page');
    await expect(heading(page, '数学学习地图')).toBeVisible();
    await navLink(page, '花园闯关').click();
    await expect(page).toHaveURL('/');
    await page.goBack();
    await expect(page).toHaveURL('/#course');
    await expect(heading(page, '数学学习地图')).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL('/');
    await expect(heading(page, '花园闯关')).toBeVisible();
    await navLink(page, '数学游戏').click();
    await expect(page).toHaveURL('/#games');
    await expect(navLink(page, '数学游戏')).toHaveAttribute('aria-current', 'location');
    await expect(heading(page, '数学游戏')).toBeVisible();
    await expect(heading(page, '今天学什么')).toBeHidden();
    for (const game of ['数一数', '图形找朋友', '接着排一排']) {
      await expect(button(page, game)).toBeInViewport({ ratio: 1 });
    }
    await button(page, '图形找朋友').click();
    await expect(heading(page, '图形找朋友')).toBeVisible();
    await navLink(page, '数学游戏').click();
    await expect(heading(page, '数学游戏')).toBeFocused();
    await openParent(page);
    await navLink(page, '花园闯关').click();
    await expect(page).toHaveURL('/');
    await expect(heading(page, '花园闯关')).toBeVisible();
    await navLink(page, '花园闯关').click();
    await expect(page).toHaveURL('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  }
});

test('普通话声音仅在明确操作时播放，选择和静音可跨页保存', async ({ page }) => {
  await page.addInitScript(() => {
    const voices = [
      { name: '测试普通话 A', lang: 'zh-CN', voiceURI: 'test-a', localService: true, default: true },
      { name: '测试普通话 B', lang: 'zh-CN', voiceURI: 'test-b', localService: true },
    ];
    const speech = new EventTarget();
    window.testSpoken = [];
    speech.getVoices = () => voices;
    speech.cancel = () => {};
    speech.speak = utterance => {
      if (utterance.volume !== 0) window.testSpoken.push({ text: utterance.text, voice: utterance.voice?.voiceURI });
      queueMicrotask(() => utterance.onend?.());
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: speech });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        constructor(text) {
          this.text = text;
          this.volume = 1;
        }
      },
    });
  });

  const spoken = () => page.evaluate(() => window.testSpoken);
  await page.goto('/');
  expect(await spoken()).toEqual([]);
  await openParent(page);
  expect(await spoken()).toEqual([]);

  const voice = page.getByRole('combobox', { name: '普通话声音', exact: true });
  await voice.selectOption('test-b');
  expect(await spoken()).toEqual([]);
  await button(page, '试听声音').click();
  await expect.poll(async () => (await spoken()).map(item => item.voice)).toEqual(['test-b']);

  await page.reload();
  await expect(voice).toHaveValue('test-b');
  expect(await spoken()).toEqual([]);
  await navLink(page, '数学游戏').click();
  await expect(button(page, '声音')).toHaveCount(0);
  await button(page, '数一数').click();
  await expect(heading(page, '数一数')).toBeVisible();
  await expect(button(page, '听题目')).toBeVisible();
  expect(await spoken()).toEqual([]);
  await button(page, '第 1 朵花').click();
  await expect.poll(async () => (await spoken()).map(item => item.voice)).toEqual(['test-b']);

  await openParent(page);
  await button(page, '练习声音').click();
  await expect(button(page, '练习声音')).toHaveAttribute('aria-pressed', 'false');
  await expect(button(page, '试听声音')).toHaveCount(0);
  await page.reload();
  await expect(button(page, '练习声音')).toHaveAttribute('aria-pressed', 'false');
  await expect(button(page, '试听声音')).toHaveCount(0);
  await navLink(page, '数学游戏').click();
  await button(page, '数一数').click();
  await expect(button(page, '听题目')).toHaveCount(0);
  await button(page, '第 1 朵花').click();
  await expect(button(page, '第 1 朵花')).toHaveAttribute('aria-pressed', 'true');
  expect(await spoken()).toEqual([]);
  await button(page, '退出游戏').click();
  for (const game of ['图形找朋友', '接着排一排']) {
    await button(page, game).click();
    await expect(heading(page, game)).toBeVisible();
    await expect(button(page, '听题目')).toHaveCount(0);
    await button(page, '退出游戏').click();
  }

  await openParent(page);
  await button(page, '练习声音').click();
  await expect(button(page, '试听声音')).toBeVisible();
  await navLink(page, '数学游戏').click();
  await button(page, '数一数').click();
  await expect(button(page, '听题目')).toBeVisible();
});

test('离线就绪后可重载，并打开从未访问的闯关和游戏', async ({ page, context }) => {
  await page.goto('/#course');
  await expect(heading(page, '数学学习地图')).toBeVisible();
  await openParent(page);
  await expect(heading(page, '离线使用')).toBeVisible();
  await expect(page.getByText('已准备好，可离线练习。', { exact: true })).toBeVisible({ timeout: 15000 });
  await button(page, '检查更新').click();
  await expect(page.getByText('当前已是最新版本。', { exact: true })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(heading(page, '家长中心')).toBeVisible();
  await navLink(page, '花园闯关').click();
  await page.getByRole('article', { name: '测量与数据' }).getByRole('link', { name: '开始闯关' }).click();
  await button(page, '乙').click();
  await expect(heading(page, '从钟面上读整时')).toBeVisible();
  await navLink(page, '数学游戏').click();
  await expect(heading(page, '数学游戏')).toBeVisible();
  await button(page, '数一数').click();
  await button(page, '第 1 朵花').click();
  await expect(button(page, '第 1 朵花')).toHaveAttribute('aria-pressed', 'true');
  await navLink(page, '学习地图').click();
  await expect(heading(page, '数学学习地图')).toBeVisible();
  await page.reload();
  await expect(heading(page, '数学学习地图')).toBeVisible();
});

test('子路径部署中新版等待家长确认，加载后保留原声音设置与进度', async ({ page }) => {
  const root = resolve(__dirname, '..');
  const prefix = '/math-garden/';
  const contentType = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
  };
  let release = 1;
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (!url.pathname.startsWith(prefix)) throw new Error('outside app scope');
      const file = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
      const path = resolve(root, file);
      if (!path.startsWith(root + sep)) throw new Error('outside project');
      let body = await readFile(path);
      if (file === 'index.html') {
        body = body.toString().replace('<html ', `<html data-test-release="${release}" `);
      }
      if (file === 'sw.js' && release === 2) {
        body = body.toString().replace(/const VERSION = '[^']+';/, "const VERSION = 'test-next-release';");
      }
      response.writeHead(200, { 'Content-Type': contentType[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });

  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    await page.goto(origin + prefix);
    await openParent(page);
    const document = page.locator('html');
    const ready = page.getByText('已准备好，可离线练习。', { exact: true });
    await expect(ready).toBeVisible({ timeout: 15000 });
    await button(page, '练习声音').click();
    await expect(button(page, '练习声音')).toHaveAttribute('aria-pressed', 'false');
    await navLink(page, '学习地图').click();
    const firstLesson = page.getByRole('link', { name: '看见几朵花', exact: true });
    await firstLesson.click();
    await button(page, '开始练习').click();
    for (const [index, answer] of ['1', '3', '2'].entries()) {
      await button(page, answer).click();
      await button(page, index < 2 ? '下一题' : '看练习结果').click();
    }
    await expect(heading(page, '这一课练完啦')).toBeVisible();
    await openParent(page);

    release = 2;
    await button(page, '检查更新').click();
    await expect(page.getByText('新版本已准备好。重新加载后就会启用。', { exact: true })).toBeVisible({ timeout: 15000 });
    const apply = button(page, '重新加载页面');
    await expect(apply).toBeVisible({ timeout: 15000 });
    await expect(document).toHaveAttribute('data-test-release', '1');
    await apply.click();
    await expect(document).toHaveAttribute('data-test-release', '2', { timeout: 15000 });
    await expect(button(page, '练习声音')).toHaveAttribute('aria-pressed', 'false');
    await expect(ready).toBeVisible();
    await navLink(page, '学习地图').click();
    await expect(firstLesson.getByText('已练 · 独立答对')).toBeVisible();
  } finally {
    server.closeAllConnections();
    await new Promise(resolveClose => server.close(resolveClose));
  }
});
