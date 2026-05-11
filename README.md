# AI导演前期工作台 MVP

面向 AI短剧、AI动画、AI漫剧创作者的本地前端原型。当前版本不接后端、不接真实 AI API，数据保存在浏览器 `localStorage`，通过“模拟解析剧本”生成示例人物、场景、机位和提示词数据。

## 文件结构

```text
.
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src
   ├─ App.tsx          # 页面、导航、编辑表单和导出逻辑
   ├─ index.css        # Tailwind 与全局样式
   ├─ main.tsx         # React 入口
   ├─ mockParser.ts    # 剧本模拟解析器
   ├─ storage.ts       # localStorage 读写
   ├─ types.ts         # Project/Character/Scene/Prompt 等类型
   └─ utils.ts         # ID、时间、状态、JSON 下载工具
```

## 运行方式

```bash
npm install
npm run dev
```

浏览器打开终端里显示的本地地址，通常是：

```text
http://127.0.0.1:5173
```

## 部署为在线网页

该项目是纯前端 Vite 应用，可直接部署到静态托管平台（Vercel / Netlify / Cloudflare Pages / GitHub Pages）。

### 1) 先本地打包确认

```bash
npm install
npm run build
```

打包产物在 `dist/` 目录。

### 2) 一键部署（推荐：Vercel）

```bash
npm install -g vercel
vercel
```

按提示完成登录与项目绑定后，Vercel 会返回线上访问链接（`https://xxx.vercel.app`）。

后续更新代码后可再次执行：

```bash
vercel --prod
```

### 3) 备选部署（Netlify）

```bash
npm install -g netlify-cli
netlify deploy
```

首次执行选择：
- Publish directory: `dist`
- Build command: `npm run build`

上线发布：

```bash
netlify deploy --prod
```

## MVP 功能

- 创建和编辑项目基础信息
- 导入 TXT 剧本或直接粘贴剧本文本
- 点击“模拟解析剧本”生成示例人物库、人物时期造型库、场景库、场景机位库和提示词库
- 手动编辑人物、时期、场景、机位和提示词字段
- 提示词状态流转：待审核、已修改、已确认、需重做、已导出
- 导出完整项目 JSON
