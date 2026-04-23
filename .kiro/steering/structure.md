# 项目结构

前后端分离的 monorepo 结构，前端在根目录，后端在 `server/` 子目录。

```
todo-app/
├── package.json                # 前端依赖与脚本
├── vite.config.ts              # Vite 构建 + Vitest 测试配置
├── tsconfig.json               # TS 项目引用入口
├── tsconfig.app.json           # 前端 TS 配置
├── tsconfig.node.json          # Vite 配置 TS 配置
├── eslint.config.js            # ESLint 扁平配置
├── docker-compose.yml          # PostgreSQL 容器
├── index.html                  # Vite SPA 入口
│
├── public/                     # 静态资源（不经构建处理）
│
├── src/                        # 前端源码
│   ├── main.tsx                # 应用入口（React 根 + QueryClientProvider）
│   ├── App.tsx                 # 根组件（useState 管理页面切换）
│   ├── index.css               # 全局样式（Tailwind 入口）
│   ├── types.ts                # 共享类型定义
│   ├── test-setup.ts           # Vitest 全局 setup
│   ├── api/                    # 数据访问层（当前 localStorage 模拟）
│   │   └── todos.ts
│   ├── hooks/                  # React Query hooks
│   │   └── useTodosQuery.ts
│   ├── pages/                  # 页面组件
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Todos.tsx
│   └── __tests__/              # 测试文件（与源码同级 __tests__ 目录）
│
└── server/                     # 后端（独立 package.json）
    ├── package.json
    ├── tsconfig.json
    ├── prisma.config.ts        # Prisma 配置
    ├── .env                    # 环境变量（DATABASE_URL, JWT_SECRET）
    ├── prisma/
    │   ├── schema.prisma       # 数据模型（User, Todo）
    │   └── migrations/         # 数据库迁移文件
    └── src/
        ├── index.ts            # Express 入口（中间件 + 路由挂载）
        ├── prisma.ts           # Prisma Client 单例
        ├── generated/prisma/   # Prisma 生成的类型和客户端（勿手动编辑）
        ├── routes/
        │   ├── auth.ts         # 认证路由（/auth/register, /auth/login）
        │   └── todos.ts        # Todo CRUD 路由（/todos）
        └── middlewares/
            └── auth.ts         # JWT 认证中间件（requireAuth）
```

## 约定

- 前端源码在 `src/`，后端源码在 `server/src/`
- 测试文件放在对应源码目录的 `__tests__/` 子目录中
- 构建产物：前端 `dist/`，后端 `server/dist/`（均已 gitignore）
- `server/src/generated/` 为 Prisma 自动生成，不要手动修改
- 数据访问逻辑放在 `src/api/`，React Query hooks 放在 `src/hooks/`
- 页面级组件放在 `src/pages/`
- 共享类型定义放在 `src/types.ts`
- 后端路由按功能拆分到 `server/src/routes/`
- 后端中间件放在 `server/src/middlewares/`
