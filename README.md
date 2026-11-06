# Muse 动态日报

每天把 Muse 动态版块（Feed）里的中美 AI 科技新闻汇总成网页版，按日归档、附原文链接与配图。

- 在线阅读：https://hazirguo.github.io/muse-feed-daily/
- 更新节奏：每天约 21:30（北京时间）自动更新当天一期
- 数据文件：`data/feed.json`（按天分组，最新一天在最前）
- 配图：`assets/YYYY-MM-DD/` 下按条目存放

页面结构：`index.html` + `styles.css` + `app.js`，纯静态，无构建步骤，GitHub Pages 直接托管根目录。
