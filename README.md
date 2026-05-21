# 校园学生成绩数据大屏

姓名：冯成宽  
学号：202310730170

## 项目说明

本项目是一个校园成绩分析大屏，采用前后端分离思路完成数据展示、接口聚合和数据库存储：

- 前端：HTML + CSS + JavaScript
- 后端：Node.js + Express
- 数据库：SQLite
- 接口：REST API
- 部署：Render Web Service 配置已准备

## 目录结构

```text
campus-score-dashboard/
├── package.json
├── render.yaml
├── server.js
├── server-local.js
├── db/
│   ├── init.sql
│   └── school.db
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── screenshots/
    └── dashboard.png
```

## 本地运行

推荐先使用零依赖本地服务预览，适合 Node 24 或没有 Visual Studio C++ 编译环境的电脑：

```bash
npm start
```

启动后访问：

```text
http://localhost:3000
```

本地服务提供首页和以下接口，数据与 `db/init.sql` 中的演示数据统计口径保持一致：

- `GET /health`
- `GET /api/overview`
- `GET /api/classes`
- `GET /api/courses`
- `GET /api/trends`

## Express + SQLite 完整版

如果本机使用 Node 20 LTS，并且 `sqlite3` 依赖安装成功，可以运行完整后端版本：

```bash
npm install
npm run start:sqlite
```

SQLite 版本启动时会自动检查 `db/school.db`。如果数据库不存在、为空或缺少数据，会读取 `db/init.sql` 自动初始化。

## Render 部署说明

项目已经补充 `render.yaml`，Render 部署时会使用 Node 20、执行 `npm install`，并通过 `npm run start:sqlite` 启动 Express + SQLite 版本。

部署步骤：

1. 将 `output/campus-score-dashboard` 上传到 GitHub 仓库。
2. 登录 Render，选择 New -> Blueprint 或 New -> Web Service。
3. 指向本项目目录，Render 会读取 `render.yaml`。
4. 构建命令：`npm install`
5. 启动命令：`npm run start:sqlite`
6. 健康检查路径：`/health`

部署完成后验证：

```text
首页：https://你的-render-service.onrender.com/
健康检查：https://你的-render-service.onrender.com/health
总览接口：https://你的-render-service.onrender.com/api/overview
班级接口：https://你的-render-service.onrender.com/api/classes
```

说明：报告中不伪造线上地址。未获得 Render 真实域名前，交付状态标注为“Render 部署配置已完成，等待平台生成正式 URL”。拿到真实 URL 后，只需回填报告脚本中的 `DEPLOY_URL` 并重新生成 PDF。
