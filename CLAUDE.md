# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目说明

基于 Vite React-TS 模板构建的 todo 应用，包含本地登录/注册页面和 todo CRUD 功能。数据通过 localStorage 持久化，认证目前仅前端校验（未接入后端）。

## 技术栈

- React 19 + TypeScript，使用 Vite 8 打包（`@vitejs/plugin-react`，基于 Oxc）。
- **Tailwind CSS v4**，通过 `@tailwindcss/vite` 插件集成（`vite.config.ts`）。入口在 `src/index.css` 的 `@import "tailwindcss"`。所有组件均使用 Tailwind utility class，暗色模式通过 `dark:` variant 适配 `prefers-color-scheme`。
- **@tanstack/react-query** 管理服务端状态（todo 数据的查询与变更）。
- ESLint 9 flat config（`eslint.config.js`），启用 `typescript-eslint`、`react-hooks`、`react-refresh`。**未**启用 type-aware 规则，如需开启参考 README。
- 包管理器：**pnpm**（lockfile 为 `pnpm-lock.yaml`）。`.npmrc` 设置了 `engine-strict=true`，`.nvmrc` 锁定 Node 24，`package.json` 要求 `node >=24.0.0`——用 npm/yarn 或低版本 Node 安装会被直接拒绝。

## 常用命令

```bash
pnpm dev        # 启动 Vite 开发服务器（HMR）
pnpm build      # 先 tsc -b（project references），再 vite build
pnpm lint       # eslint .
pnpm preview    # 预览生产构建
```

目前没有配置测试框架，不要臆造 `pnpm test`。

## 架构

### 路由与认证

没有使用路由库。`App.tsx` 通过 `useState<Page>` 手动切换三个页面：`login` → `register` → `todos`。Login/Register 页面仅做前端表单校验（邮箱格式、密码长度），通过校验即调用 `onSuccess` 跳转，尚未接入真实后端认证。

### 数据层

- **`src/api/todos.ts`**：封装 localStorage 的 CRUD 操作，所有函数返回 Promise（带 200ms 模拟延迟），对外模拟异步 API 接口。存储 key 为 `todo-app:todos`。
- **`src/hooks/useTodosQuery.ts`**：基于 react-query 封装 `useTodosQuery`、`useAddTodo`、`useToggleTodo`、`useDeleteTodo` 四个 hooks，mutation 成功后通过 `invalidateQueries` 刷新列表。
- **QueryClient 配置**（`main.tsx`）：`staleTime: Infinity`，`refetchOnWindowFocus: false`——数据不会自动过期或重新拉取，仅在 mutation 触发 invalidation 时刷新。

### TypeScript 结构

使用 project references：根 `tsconfig.json` 组合了 `tsconfig.app.json`（`src/` 应用代码）和 `tsconfig.node.json`（Vite 等工具配置）。`pnpm build` 中的 `tsc -b` 会按引用关系编译——修改编译选项时要改对应的子配置文件，而不是根 `tsconfig.json`。

## 用户画像

前端开发工程师，工作年限约 1 年 9 个月。

**熟悉：** React、TypeScript（日常使用），前端开发日常流程。

**薄弱：** Node.js 后端开发、项目构建（打包、工程化配置）、部署（上线流程、CI/CD 等）。

**学习目标：** 通过本项目补足后端、构建、部署的短板，不回避弱项，正面突破。
