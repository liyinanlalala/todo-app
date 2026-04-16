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
    ├── main.tsx            # 应用入口，挂载 React 根组件 + QueryClientProvider
    ├── App.tsx             # 根组件，手动管理页面切换（login/register/todos）
    ├── App.css             # 组件样式（todo 列表、认证卡片）
    ├── index.css           # 全局样式（CSS 变量、暗色模式）
    ├── types.ts            # 共享类型定义（Todo）
    ├── api/                # 数据访问层（当前为 localStorage 模拟）
    │   └── todos.ts        # Todo CRUD 操作，模拟异步延迟
    ├── hooks/              # 自定义 React Hooks
    │   └── useTodosQuery.ts # React Query hooks（查询、添加、切换、删除）
    └── pages/              # 页面组件
        ├── Login.tsx       # 登录页（表单验证，认证逻辑待接入）
        ├── Register.tsx    # 注册页（表单验证，认证逻辑待接入）
        └── Todos.tsx       # Todo 列表页（增删改查）
```

## 约定

- 前端源码统一放在 `src/` 目录下
- 静态资源分两类：`public/`（原样复制）和 `src/assets/`（经 Vite 处理）
- 构建产物输出到 `dist/`（已在 `.gitignore` 中忽略）
- 配置文件放在项目根目录
- 数据访问逻辑放在 `src/api/`，React Query hooks 放在 `src/hooks/`
- 页面级组件放在 `src/pages/`
- 共享类型定义放在 `src/types.ts`
