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
