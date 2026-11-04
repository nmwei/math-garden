import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const remote = 'git@github.com:nmwei/math-garden.git';
const sitePaths = ['app', 'assets', 'index.html', 'course.html', 'parent.html', 'manifest.webmanifest', 'sw.js'];

function localGit(...args) {
  return execFileSync('git', args, {
    cwd: root, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  }).trim();
}

function checkSource() {
  if (localGit('branch', '--show-current') !== 'main') throw new Error('请切到 main 分支再发布。');
  if (localGit('status', '--porcelain')) throw new Error('请先提交工作区的改动，再运行 npm run deploy。');
  return localGit('rev-parse', 'HEAD');
}

async function publish() {
  const source = checkSource();
  const temp = await mkdtemp(join(tmpdir(), 'math-garden-publish-'));
  try {
    const env = { ...process.env, GIT_INDEX_FILE: join(temp, 'site-index') };
    const git = (args, input) => execFileSync('git', ['--git-dir', temp, ...args], { env, input, encoding: 'utf8' });
    execFileSync('git', ['init', '--bare', '--quiet', temp], { env });
    git(['fetch', '--quiet', '--no-tags', remote, 'main:refs/heads/main', 'gh-pages:refs/heads/gh-pages']);
    git(['fetch', '--quiet', '--no-tags', root, `${source}:refs/heads/source`]);
    try {
      git(['merge-base', '--is-ancestor', 'refs/heads/main', source]);
    } catch (error) {
      if (error.status !== 1) throw error;
      throw new Error('本地 main 缺少远程提交。请先同步 origin/main，再重新发布。');
    }

    const entries = git(['ls-tree', '-r', '-z', source, '--', ...sitePaths]);
    const files = new Set();
    for (const entry of entries.split('\0').filter(Boolean)) {
      const separator = entry.indexOf('\t');
      if (!/^100(644|755) blob /.test(entry)) throw new Error(`发布目录里有非常规文件：${entry.slice(separator + 1)}`);
      files.add(entry.slice(separator + 1));
    }
    for (const path of sitePaths.slice(2)) {
      if (!files.has(path)) throw new Error(`源码提交缺少发布文件：${path}`);
    }

    const worker = git(['show', `${source}:sw.js`]);
    const precache = worker.match(/const files = \[([\s\S]*?)\]\.map\(/);
    const version = /^const VERSION = '([^']+)';$/m;
    if (!precache || !version.test(worker)) throw new Error('无法读取 sw.js 的离线文件清单或版本号。');
    for (const [, path] of precache[1].matchAll(/'([^']+)'/g)) {
      if (!files.has(path)) throw new Error(`离线清单中的文件未提交：${path}`);
    }

    // Only the temporary index is written. Site files come from the source commit.
    git(['update-index', '-z', '--index-info'], entries);
    const noJekyll = git(['hash-object', '-w', '--stdin'], '').trim();
    git(['update-index', '--add', '--cacheinfo', `100644,${noJekyll},.nojekyll`]);

    // A content fingerprint changes the offline cache when site files change.
    const fingerprint = git(['write-tree']).trim().slice(0, 12);
    const stampedWorker = worker.replace(version, (_, base) => `const VERSION = '${base}+${fingerprint}';`);
    const workerBlob = git(['hash-object', '-w', '--stdin'], stampedWorker).trim();
    git(['update-index', '--cacheinfo', `100644,${workerBlob},sw.js`]);
    const tree = git(['write-tree']).trim();
    const parent = git(['rev-parse', 'refs/heads/gh-pages']).trim();
    const previousTree = git(['rev-parse', `${parent}^{tree}`]).trim();
    const snapshot = tree === previousTree ? parent : git([
      'commit-tree', tree, '-p', parent, '-m', `deploy: ${source.slice(0, 12)}`,
    ]).trim();

    if (checkSource() !== source) throw new Error('本地提交在准备发布时发生变化，请重新运行 npm run deploy。');
    execFileSync('git', ['--git-dir', temp, 'push', '--atomic', remote,
      `${source}:refs/heads/main`, `${snapshot}:refs/heads/gh-pages`], { env, stdio: 'inherit' });
    console.log(`已推送源码 ${source.slice(0, 12)} 与发布快照 ${snapshot.slice(0, 12)}。`);
    console.log('GitHub Pages 地址（部署完成后生效）：https://nmwei.github.io/math-garden/');
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

try {
  await publish();
} catch (error) {
  console.error(`发布失败：${error.message}`);
  process.exitCode = 1;
}
