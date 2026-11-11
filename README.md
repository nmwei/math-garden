# 123 小花园 · Math Garden

面向学龄前到小学三年级的数学学习站。学习地图提供例题、变式练习和间隔复习。花园闯关按数与计算、图形与规律、测量与数据推荐下一步。数学游戏有数一数、图形找朋友、接着排一排、哪边更多和凑满花坛。家长中心可以调整声音、查看离线状态和检查更新。

[打开 123 小花园](https://nmwei.cn/math-garden/)

[课程覆盖、教学依据与完善计划](docs/curriculum.md)

学习地图的「综合」组有数学工坊，可以画图解生活题、动手换一种表示分数的方法，以及做跨主题复习。

界面设计约定见 [家长弹窗与应用更新](docs/ui-guidelines.md)。

## 本地运行

安装 Node.js、npm 和 Python 3 后运行：

```sh
npm ci
npm run dev
```

打开 [本地预览](http://127.0.0.1:4175/)。首次联网打开后，浏览器会自动缓存课程、游戏和图示。家长中心显示「已准备好，可离线练习」后，即可断网重开。学习进度和设置保存在当前浏览器。

## 服务器发布

正式地址：[打开花园](https://nmwei.cn/math-garden/)。GitHub 保留源码，发布脚本不再推送 `main` 或 `gh-pages`，源码推送单独进行。

需要 Node.js 20+、SSH 和 rsync。服务器已配置独立部署账号，默认连接 `garden-deploy@106.15.155.26`，本机专用密钥位于 `~/.ssh/garden_deploy_nmwei`；私钥不进入仓库。换电脑需安全配置自己的部署权限，并通过可信渠道核对服务器主机指纹，不关闭 SSH 主机校验。

```sh
npm run deploy -- --dry-run             # 构建、冻结快照和校验，不连接服务器
npm run deploy                         # 发布当前项目
npm run deploy -- --rollback           # 切回本项目上一个成功版本
```

默认从 `main` 的干净工作区发布。确需发布已经审阅、尚未提交的改动时，显式加 `--allow-dirty`；版本元数据会记录 `dirty: true`，不会自动暂存、提交或推送。`--host user@host`、`--key /absolute/key` 可覆盖 SSH 配置，也支持 `GARDEN_DEPLOY_HOST`、`GARDEN_DEPLOY_KEY`。

执行链路：重新构建 → 冻结 `dist/` 快照 → 按哈希增量上传到本项目独立版本目录 → 服务器逐文件校验 → 原子切换 `current` → 内部 HTTP 核对。检查失败自动恢复旧入口；上传失败不切换。根目录 `_release.json` 提供源码提交、发布编号及工作区状态。发布后还应核对正式 HTTPS 地址，脚本的内部检查不能替代公网或真实 iPad 验收。

发布产物仅包含静态页面与学习素材，不上传 Git、环境变量、依赖和本机学习数据。旧版本保留供回退；磁盘清理需保留 `current`、`previous` 指向的版本，不自动删除历史发布。三个仓库的发布工具副本保持一致，修改公共发布逻辑时同步三个仓库并运行发布测试。

旧 GitHub Pages 暂时保留迁移期间的访问能力，后续不再更新。旧域名里的学习记录不会自动进入新域名，旧主屏幕图标仍指向旧站；账号/云端同步和完整数据迁移另行实现，先保留旧站数据。

构建入口为 `npm run build`，仅复制静态文件白名单，校验离线清单与音效哈希，并根据内容生成 SW 指纹；新增离线文件仍需维护 `sw.js` 的 `files`。

## 测试

```sh
npx playwright install chromium webkit
npm test
npm test -- --browser=webkit
```

测试覆盖课程、游戏、平板导航、断网重开和版本更新。

## 答题音效

答对使用用户选定的 Mixkit A2（Correct answer reward），答错使用 B2（Wrong answer fail notification）。音频统一到 -16 LUFS、真峰值上限 -2 dBTP，24 kHz 单声道 PCM16；保留原时长、语速和音高。来源及处理哈希见 `assets/audio/feedback-sources.json`，播放逻辑为 `app/feedback-audio.js`。题目朗读、切题、离开页面及进入后台会取消旧音效。

两个 WAV 与现有声音素材一起保存在源码仓库的 `assets/audio/` 中，构建时校验 SHA-256，并随站点打包和离线缓存。重新拉取项目即可获得音频；启动、构建和部署无需再下载原音源，也不需要 FFmpeg。来源及许可记录保留在 `assets/audio/feedback-sources.json`。

全部明确判题统一使用 A2／B2 和 1.4 秒小花上飘，覆盖学习地图练习、复习、五项游戏及示范、工坊、闯关与学习起点。自动换题先呈现反馈，也可点“继续”提前进入下一题；离开或进入后台取消旧反馈，后台返回可继续，不补播旧题。“还不确定”、看提示和展开解法保持中性。
