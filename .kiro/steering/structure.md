# 项目结构

```
todo-app/
├── index.html              # 入口 HTML（Vite SPA 模板）
├── package.json            # 项目依赖与脚本
├── pnpm-lock.yaml          # pnpm 锁文件
├── .nvmrc                  # Node 版本锁定（24）
├── .npmrc                  # npm 配置（engine-strict）
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 项目引用入口
├── tsconfig.app.json       # 前端源码 TS 配置
├── tsconfig.node.json      # Node 端（Vite 配置）TS 配置
├── eslint.config.js        # ESLint 扁平配置
├── todo-app-roadmap.md     # 项目开发路线图
├── public/                 # 静态资源（不经过构建处理）
│   ├── favicon.svg
│   └── icons.svg
└── src/                    # 前端源码
    ├── main.tsx            # 应用入口，挂载 React 根组件
    ├── App.tsx             # 根组件
    ├── App.css             # 根组件样式
    ├── index.css           # 全局样式（CSS 变量、暗色模式）
    └── assets/             # 需要构建处理的静态资源（图片等）
```

## 约定

- 前端源码统一放在 `src/` 目录下
- 静态资源分两类：`public/`（原样复制）和 `src/assets/`（经 Vite 处理）
- 构建产物输出到 `dist/`（已在 `.gitignore` 中忽略）
- 配置文件放在项目根目录
