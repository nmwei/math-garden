# 123 小花园 · Math Garden

面向学龄前到小学三年级的数学学习站。学习地图提供例题、变式练习和间隔复习。花园闯关按数与计算、图形与规律、测量与数据推荐下一步。数学游戏有数一数、图形找朋友、接着排一排、哪边更多和凑满花坛。家长中心可以调整声音、查看离线状态和检查更新。

[打开 123 小花园](https://nmwei.github.io/math-garden/)

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

## GitHub Pages 发布

在 `main` 分支提交代码，并同步远程更新。工作区干净后运行：

```sh
npm run deploy
```

脚本需要有 `nmwei/math-garden` 推送权限的 GitHub SSH 凭据。它从已提交的源码生成站点快照，将源码和快照一次推送到 `main` 和 `gh-pages`。GitHub Pages 使用 `gh-pages` 的根目录。推送完成后，可到仓库的 [Actions](https://github.com/nmwei/math-garden/actions) 查看部署状态。

站点内容改变时，发布脚本会自动生成新的线上离线缓存版本。新增需要离线使用的资源时，把路径加入 `sw.js` 的 `files` 清单。已打开旧版的设备可以在家长中心检查更新并重新加载。

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
