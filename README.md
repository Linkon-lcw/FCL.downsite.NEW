# XiaoluoFoxington/FCL.downsite.NEW

## 项目介绍

[《Fold Craft Launcher》](https://github.com/FCL-Team/FoldCraftLauncher)（下文简称“FCL”）非官方公益下载站，由玩家社区自发搭建。

除了FCL，下载站还提供其他启动器、渲染器和插件等多种资源，以帮助玩家更加方便地在Android设备上进行游戏。

这是一个静态网站，不需要后端，可以部署在任何静态网站服务器上。

这是下载站的第4次重制，以下为下载站旧版本，将不会有任何更新。

第3次重制：[XiaoluoFoxington/FCL.website.NEXT](https://github.com/XiaoluoFoxington/FCL.website.NEXT)。

第2次重制：[XiaoluoFoxington/FCL.website.mdui](https://github.com/XiaoluoFoxington/FCL.website.mdui)。

第1次重制：[fcl-docs/FCL.website](https://github.com/fcl-docs/FCL.website)。

## 项目特点

- 烂大街的MDUI。
- 能跑就行的JS。
- 随意命名的函数/变量。
- 不务正业地塞彩蛋。
- 无任何框架，纯原生HTML/CSS/JS。

## 数据与代码结构

- `data/software.json` 是软件 ID、名称、图标、标签和详情文件地址的唯一基础数据源。
- `js/http/` 统一处理请求、超时、取消、错误和页面内缓存。
- `js/repositories/` 负责获取本站数据和镜像数据，`js/controllers/` 管理页面状态，`js/views/` 只负责 DOM 渲染。
- `js/adapters/download/` 中的每个文件只适配一种下载站数据结构，最终统一输出 `name`、`version`、`architecture`、`size`、`description`、`downloadUrl`、`available` 和 `source`。

### 新增下载线路

1. 若新线路使用已支持的数据结构，只需在 `data/mirror.json` 添加镜像，并在软件详情的 `download` 中引用它。
2. 若数据结构不同，在 `js/adapters/download/` 新增一个只做数据转换的纯函数文件，再在 `index.js` 的注册表中登记对应 `apiVer`。
3. 适配器不得请求网络或操作 DOM；额外接口请求放在 repository 中，页面交互和取消逻辑放在 controller 中。
