# AI 动态日报

每天把 Muse 动态版块（Feed）里的中美 AI 科技新闻汇总成网页版，按日归档、附原文链接与配图。

- 在线阅读：https://hazirguo.github.io/ai-feed-daily/
- 更新节奏：每小时同步一次当天内容
- 首页只展示最近 7 天；更早的内容点页面右侧悬浮日历中带条数标记的日期查看
- 数据文件：`data/feed.json`（按天分组，最新一天在最前）
- 配图：`assets/YYYY-MM-DD/` 下按条目存放

页面结构：`index.html` + `styles.css` + `app.js`，纯静态，无构建步骤，GitHub Pages 直接托管根目录。
