# 技术栈与构建

## 运行环境

- Node.js >= 24（通过 nvm 管理，见 `.nvmrc`）
- 包管理器：pnpm（`engine-strict=true`，严格校验 Node 版本）

## 前端技术栈

| 类别       | 技术                                                       |
| ---------- | ---------------------------------------------------------- |
| 框架       | React 19 + TypeScript 6                                    |
| 构建工具   | Vite 8（@vitejs/plugin-react）                             |
| 服务端状态 | TanStack React Query 5                                     |
| Lint       | ESLint 9 + typescript-eslint + react-hooks + react-refresh |

## 规划中的技术栈（尚未引入）

- 样式：Tailwind CSS
- 后端：Node.js + Express
- 数据库：PostgreSQL + Prisma
- 认证：JWT + bcrypt
- 容器化：Docker + Docker Compose
- 部署：Railway（后端）+ Vercel（前端）
- CI/CD：GitHub Actions

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（HMR）
pnpm dev

# 类型检查 + 生产构建
pnpm build

# ESLint 检查
pnpm lint

# 预览生产构建
pnpm preview
```

## TypeScript 配置

- 目标：ES2023
- JSX：react-jsx
- 模块解析：bundler 模式
- 严格检查：`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`
- 项目引用：`tsconfig.app.json`（src 目录）+ `tsconfig.node.json`（Vite 配置）

## 代码风格约定

- 使用中文编写代码注释和 UI 文案
- 组件使用 `function` 声明 + `export default`
- 类型优先使用 `type` 而非 `interface`
- 使用 `import type` 进行类型导入
- API 层模拟异步延迟（200ms），为后续接入真实后端做准备
- React Query 的 mutation 在 `onSuccess` 中通过 `invalidateQueries` 刷新列表
