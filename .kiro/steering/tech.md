# 技术栈与构建

## 运行环境

- Node.js >= 24（通过 nvm 管理，见 `.nvmrc`）
- 包管理器：pnpm（`engine-strict=true`）

## 前端技术栈

| 类别       | 技术                                                       |
| ---------- | ---------------------------------------------------------- |
| 框架       | React 19 + TypeScript 6                                    |
| 构建工具   | Vite 8（@vitejs/plugin-react）                             |
| 样式       | Tailwind CSS 4（@tailwindcss/vite 插件）                   |
| UI 组件库  | Ant Design 6 + @ant-design/icons                           |
| 服务端状态 | TanStack React Query 5                                     |
| 测试       | Vitest 4 + Testing Library + jsdom                         |
| Lint       | ESLint 9 + typescript-eslint + react-hooks + react-refresh |

## 后端技术栈

| 类别   | 技术                            |
| ------ | ------------------------------- |
| 框架   | Express 5                       |
| 语言   | TypeScript 6（ESM，tsx 热重载） |
| 数据库 | PostgreSQL 16（Docker）         |
| ORM    | Prisma 7（@prisma/adapter-pg）  |
| 认证   | JWT（httpOnly cookie）+ bcrypt  |

## 常用命令

### 前端（项目根目录）

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动 Vite 开发服务器（HMR）
pnpm build            # 类型检查 + 生产构建
pnpm lint             # ESLint 检查
pnpm test             # 运行测试（vitest run，单次执行）
pnpm preview          # 预览生产构建
```

### 后端（`server/` 目录）

```bash
pnpm install          # 安装依赖
pnpm dev              # tsx watch 热重载开发
pnpm build            # TypeScript 编译
pnpm start            # 运行编译产物
```

### 数据库

```bash
docker compose up -d                          # 启动 PostgreSQL
cd server && pnpm prisma migrate dev          # 运行数据库迁移
cd server && pnpm prisma generate             # 生成 Prisma Client
```

## TypeScript 配置

### 前端（`tsconfig.app.json`）

- 目标：ES2023，JSX：react-jsx
- 模块解析：bundler 模式
- 严格检查：`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`

### 后端（`server/tsconfig.json`）

- 目标：ESNext，模块：NodeNext
- 严格模式，`verbatimModuleSyntax`
- 导入需带 `.js` 扩展名（ESM 规范）

## 代码风格约定

- 使用中文编写代码注释和 UI 文案
- 组件使用 `function` 声明 + `export default`
- 类型优先使用 `type` 而非 `interface`
- 使用 `import type` 进行类型导入（`verbatimModuleSyntax`）
- 后端 ESM 导入路径必须带 `.js` 后缀
- React Query 的 mutation 在 `onSuccess` 中通过 `invalidateQueries` 刷新列表
- 环境变量通过 `process.env['KEY']` 方括号语法访问

## 认证机制

- JWT 存储在 httpOnly cookie 中（非 Authorization header）
- 前端所有请求需带 `credentials: 'include'` 以发送/接收 cookie
- 后端 CORS 配置 `credentials: true`，`origin` 指定前端地址
- cookie 配置：`httpOnly`、`sameSite: 'lax'`、`secure: false`（开发环境）
- 前端通过 `GET /auth/me` 检查登录态，失败则跳转登录页
