# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目说明

前后端分离的全栈 todo 应用。前端基于 Vite React-TS，包含登录/注册页面和 todo CRUD 功能；后端基于 Express + Prisma + PostgreSQL，提供 auth 和 todos REST API。前后端已对接，认证通过 HttpOnly cookie 实现。

## 技术栈

### 前端

- React 19 + TypeScript，使用 Vite 8 打包（`@vitejs/plugin-react`，基于 Oxc）。
- **Ant Design v6** 作为 UI 组件库，配合 **Tailwind CSS v4**（通过 `@tailwindcss/vite` 插件集成）做布局微调。
- **@tanstack/react-query** 管理服务端状态（todo 数据的查询与变更）。
- ESLint 9 flat config（`eslint.config.js`），启用 `typescript-eslint`、`react-hooks`、`react-refresh`。**未**启用 type-aware 规则。
- **Vitest**（jsdom 环境）+ `@testing-library/react` + `@testing-library/user-event` 做组件测试，`@vitest/coverage-v8` 做覆盖率。配置在 `vite.config.ts` 的 `test` 字段，setup 文件为 `src/test-setup.ts`。

### 后端（`server/`）

- **Express 5** + TypeScript，使用 `tsx watch` 开发热重载。
- **Prisma 7**（`@prisma/client` + `@prisma/adapter-pg`）作为 ORM，schema 定义 User 和 Todo 两个模型。Prisma Client 输出到 `server/src/generated/prisma`。
- **PostgreSQL 16**，通过 `docker-compose.yml` 管理，数据持久化到 Docker volume `pgdata`。
- 认证：**bcrypt** 密码哈希 + **jsonwebtoken** JWT，通过 **HttpOnly cookie** 传递（7 天有效期），使用 **cookie-parser** 解析。
- CORS 配置了 `credentials: true`，前端 origin 为 `http://localhost:5173`。

### 通用

- 包管理器：**pnpm**（前端和后端各有独立的 `pnpm-lock.yaml`）。
- `.nvmrc` 锁定 Node 24，`package.json` 要求 `node >=24.0.0`，`.npmrc` 设置 `engine-strict=true`。

## 常用命令

```bash
# 前端（项目根目录）
pnpm dev          # 启动 Vite 开发服务器（HMR）
pnpm build        # tsc -b + vite build
pnpm lint         # eslint .
pnpm test         # vitest run（全部测试）
npx vitest run src/pages/__tests__/Login.test.tsx   # 运行单个测试文件

# 后端（server/ 目录）
cd server
pnpm dev          # tsx watch src/index.ts（热重载）
pnpm build        # tsc 编译到 dist/
pnpm start        # node dist/index.js（生产模式）

# 数据库
docker compose up -d                    # 启动 PostgreSQL
cd server && npx prisma migrate dev     # 执行迁移
cd server && npx prisma generate        # 重新生成 Prisma Client
```

## 环境变量

根目录 `.env`（docker-compose 使用）：`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`。

`server/.env`（后端运行时使用）：`DATABASE_URL`、`JWT_SECRET`。

## 架构

### 认证流程

采用 HttpOnly cookie 方案。登录/注册成功后，后端通过 `Set-Cookie` 写入 JWT；前端所有请求带 `credentials: 'include'`，浏览器自动携带 cookie。前端启动时调用 `GET /auth/me` 检查登录态，已登录则直接进入 Todos 页，未登录显示登录页。

### 前端路由与页面

没有使用路由库。`App.tsx` 通过 `useState<Page>` 手动切换页面：启动时检查登录态 → 未登录进 `login`/`register` → 登录成功进 `todos`。Login/Register 使用 Ant Design Form 组件，调用后端 auth API。

### 前端数据层

- `src/api/auth.ts`：封装 login/register/logout/checkAuth，所有请求带 `credentials: 'include'`。
- `src/api/todos.ts`：封装 `/todos` REST API 的 CRUD 操作（fetch + `credentials: 'include'`）。
- `src/hooks/useTodosQuery.ts`：基于 react-query 封装 `useTodosQuery`、`useAddTodo`、`useToggleTodo`、`useDeleteTodo` 四个 hooks，mutation 成功后通过 `invalidateQueries` 刷新列表。
- QueryClient 配置（`main.tsx`）：`staleTime: Infinity`，`refetchOnWindowFocus: false`——仅在 mutation 触发 invalidation 时刷新。

### 后端 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /auth/register | 注册（409 邮箱已存在） | 否 |
| POST | /auth/login | 登录（401 凭据错误） | 否 |
| GET | /auth/me | 检查登录态，返回用户信息 | cookie |
| POST | /auth/logout | 清除 cookie | 否 |
| GET | /todos | 查询当前用户的 todo 列表 | cookie |
| POST | /todos | 创建 todo | cookie |
| PATCH | /todos/:id | 更新 todo | cookie |
| DELETE | /todos/:id | 删除 todo | cookie |
| GET | /health | 健康检查 | 否 |

- `server/src/index.ts`：Express 入口，挂载 cors（credentials）、cookie-parser、json 解析、路由。默认端口 3000。
- `server/src/middlewares/auth.ts`：从 `req.cookies['token']` 读取 JWT，验证后挂载 `req.userId`。通过 declare global 扩展 Express Request 类型。
- `server/src/prisma.ts`：Prisma Client 单例，供各路由共享。

### TypeScript 结构

前端使用 project references：根 `tsconfig.json` 组合了 `tsconfig.app.json`（应用代码）和 `tsconfig.node.json`（工具配置）。修改编译选项时要改对应的子配置，不是根 `tsconfig.json`。

后端有独立的 `server/tsconfig.json`。Prisma 配置文件为 `server/prisma.config.ts` 和 `server/prisma/schema.prisma`。
