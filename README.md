# 个人博客 — github.io

纯前端个人博客，基于 GitHub Pages 托管，通过提交 Markdown 文件即可发布新文章。

## ✨ 特性

- 🚀 纯前端，无需后端，GitHub Pages 免费托管
- 📝 提交 `.md` 文件即可发布，GitHub Actions 自动更新文章索引
- 🎨 简洁风格，优雅过渡动画
- 🗂️ 文章分类 + 按发布时间排序
- 📖 文章详情页自动生成目录（TOC）
- 📱 响应式布局，手机电脑均可正常浏览

## 📂 目录结构

```
├── index.html            # 首页
├── post.html             # 文章详情页
├── style.css             # 公共样式
├── index.css             # 首页样式
├── post.css              # 文章页样式
├── app.js                # 首页逻辑
├── post.js               # 文章页逻辑
├── config.js             # 博客配置（标题、简介等）
├── posts/
│   ├── index.json        # 文章索引（自动生成，勿手动编辑）
│   └── *.md              # Markdown 文章
├── scripts/
│   └── generate_index.py # 生成 posts/index.json 的脚本
└── .github/workflows/
    └── generate-index.yml # 自动更新索引的 GitHub Action
```

## 🚀 快速开始

### 1. Fork 本仓库

Fork 到你的 GitHub 账号，仓库名改为 `<你的用户名>.github.io`。

### 2. 开启 GitHub Pages

进入仓库 **Settings → Pages**，将 Source 设为 `Deploy from a branch`，Branch 选 `main`，目录选 `/（root）`，保存。

### 3. 修改博客配置

编辑 `config.js`，填写你的博客名称、简介、作者名等。

### 4. 写文章

在 `posts/` 目录下新建 `.md` 文件，文件开头加上 frontmatter：

```markdown
---
title: 我的新文章
date: 2024-06-01
category: 技术
tags: [JavaScript, 前端]
description: 文章的一句话简介，显示在首页卡片上。
---

正文内容从这里开始……
```

然后 push：

```bash
git add posts/my-new-post.md
git commit -m "新文章：我的新文章"
git push
```

GitHub Action 会自动更新 `posts/index.json`，首页随即更新。

## 🛠 本地运行

由于浏览器跨域限制，需要起一个本地 HTTP 服务器：

```bash
# Python 3
python3 -m http.server 8080

# Node.js（需安装 npx）
npx serve .
```

然后访问 `http://localhost:8080`。

## 📝 frontmatter 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 发布日期，格式 `YYYY-MM-DD` |
| `category` | 推荐 | 文章分类，用于筛选 |
| `tags` | 可选 | 标签列表，格式 `[tag1, tag2]` |
| `description` | 推荐 | 摘要，显示在首页卡片 |
