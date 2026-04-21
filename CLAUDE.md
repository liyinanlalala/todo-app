# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目说明

前后端分离的 todo 应用。前端基于 Vite React-TS 模板，包含登录/注册页面和 todo CRUD 功能；后端基于 Express + Prisma + PostgreSQL，提供 auth 和 todos REST API。前端目前尚未对接后端，数据仍通过 localStorage 持久化、认证仅做前端校验。

## 技术栈

### 前端

- React 19 + TypeScript，使用 Vite 8 打包（`@vitejs/plugin-react`，基于 Oxc）。
- **Ant Design v6** 作为 UI 组件库（Button、Card、Form、Input、Typography 等），配合 **Tailwind CSS v4**（通过 `@tailwindcss/vite` 插件集成）做布局微调。
- **@tanstack/react-query** 管理服务端状态（todo 数据的查询与变更）。
- ESLint 9 flat config（`eslint.config.js`），启用 `typescript-eslint`、`react-hooks`、`react-refresh`。**未**启用 type-aware 规则，如需开启参考 README。

### 后端（`server/`）

- **Express 5** + TypeScript，使用 `tsx watch` 开发热重载。
- **Prisma 7**（`@prisma/client` + `@prisma/adapter-pg`）作为 ORM，schema 定义 User 和 Todo 两个模型。Prisma Client 输出到 `server/src/generated/prisma`。
- **PostgreSQL 16**，通过 `docker-compose.yml` 管理，数据持久化到 Docker volume `pgdata`。
- 认证：**bcrypt** 密码哈希 + **jsonwebtoken** JWT。
- 路由：`/auth`（登录/注册）、`/todos`（CRUD）、`/health`（健康检查）。

### 通用

- 包管理器：**pnpm**（前端和后端各有独立的 `pnpm-lock.yaml`）。`.npmrc` 设置了 `engine-strict=true`，`.nvmrc` 锁定 Node 24，根 `package.json` 要求 `node >=24.0.0`。

## 常用命令

```bash
# 前端（项目根目录）
pnpm dev        # 启动 Vite 开发服务器（HMR）
pnpm build      # 先 tsc -b（project references），再 vite build
pnpm lint       # eslint .
pnpm test       # vitest run
pnpm preview    # 预览生产构建

# 后端（server/ 目录）
cd server
pnpm dev        # tsx watch src/index.ts（热重载）
pnpm build      # tsc 编译到 dist/
pnpm start      # node dist/index.js（生产模式）

# 数据库
docker compose up -d          # 启动 PostgreSQL
cd server && npx prisma migrate dev   # 执行迁移
```

前端测试：**Vitest**（jsdom 环境），配合 `@testing-library/react`、`@testing-library/user-event` 做组件测试，`@vitest/coverage-v8` 做覆盖率。配置在 `vite.config.ts` 的 `test` 字段，setup 文件为 `src/test-setup.ts`。

## 架构

### 路由与认证

- **前端**：没有使用路由库。`App.tsx` 通过 `useState<Page>` 手动切换三个页面：`login` → `register` → `todos`。Login/Register 使用 Ant Design Form 组件，仅做前端表单校验（邮箱格式、密码长度），通过校验即调用 `onSuccess` 跳转，尚未对接后端 API。
- **后端**：`server/src/routes/auth.ts` 提供 `/auth` 路由（注册/登录），使用 bcrypt 哈希密码、JWT 签发 token。`server/src/middlewares/` 存放认证中间件。

### 数据层

**前端（当前仍为 localStorage 模拟）：**
- **`src/api/todos.ts`**：封装 localStorage 的 CRUD 操作，所有函数返回 Promise（带 200ms 模拟延迟），对外模拟异步 API 接口。存储 key 为 `todo-app:todos`。
- **`src/hooks/useTodosQuery.ts`**：基于 react-query 封装 `useTodosQuery`、`useAddTodo`、`useToggleTodo`、`useDeleteTodo` 四个 hooks，mutation 成功后通过 `invalidateQueries` 刷新列表。
- **QueryClient 配置**（`main.tsx`）：`staleTime: Infinity`，`refetchOnWindowFocus: false`——数据不会自动过期或重新拉取，仅在 mutation 触发 invalidation 时刷新。

**后端（Prisma + PostgreSQL）：**
- **`server/prisma/schema.prisma`**：定义 `User`（id, email, password, createdAt）和 `Todo`（id, title, completed, createdAt, userId）两个模型，Todo 通过 `userId` 关联 User。
- **`server/src/routes/todos.ts`**：提供 `/todos` CRUD REST API。
- **`server/src/prisma.ts`**：Prisma Client 实例，供各路由共享。

### TypeScript 结构

前端使用 project references：根 `tsconfig.json` 组合了 `tsconfig.app.json`（`src/` 应用代码）和 `tsconfig.node.json`（Vite 等工具配置）。`pnpm build` 中的 `tsc -b` 会按引用关系编译——修改编译选项时要改对应的子配置文件，而不是根 `tsconfig.json`。

后端有独立的 `server/tsconfig.json`。Prisma 配置文件为 `server/prisma.config.ts` 和 `server/prisma/schema.prisma`，Prisma Client 生成到 `server/src/generated/prisma`。

## 用户画像

前端开发工程师，工作年限约 1 年 9 个月。

**熟悉：** React、TypeScript（日常使用），前端开发日常流程。

**薄弱：** Node.js 后端开发、项目构建（打包、工程化配置）、部署（上线流程、CI/CD 等）。

**学习目标：** 通过本项目补足后端、构建、部署的短板，不回避弱项，正面突破。
