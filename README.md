# Todo App

全栈待办事项管理应用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite 8 |
| UI | Ant Design 6 + Tailwind CSS 4 |
| 状态管理 | TanStack React Query |
| 后端 | Express 5 + TypeScript |
| 数据库 | PostgreSQL 16（Docker） |
| ORM | Prisma 7 |
| 认证 | JWT + bcrypt，HttpOnly cookie |
| 测试 | Vitest + Testing Library |

## 快速开始

### 前置要求

- Node.js >= 24（推荐使用 `nvm use`）
- pnpm
- Docker（用于运行 PostgreSQL）

### 安装与启动

```bash
# 1. 安装依赖
pnpm install
cd server && pnpm install && cd ..

# 2. 配置环境变量
# 根目录 .env 配置 PostgreSQL（POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB）
# server/.env 配置 DATABASE_URL 和 JWT_SECRET

# 3. 启动数据库
docker compose up -d

# 4. 运行数据库迁移
cd server && npx prisma migrate dev && cd ..

# 5. 启动后端（端口 3000）
cd server && pnpm dev &

# 6. 启动前端（端口 5173）
pnpm dev
```

打开 http://localhost:5173 即可使用。

## 常用命令

```bash
# 前端（项目根目录）
pnpm dev          # 启动开发服务器
pnpm build        # 生产构建
pnpm lint         # ESLint 检查
pnpm test         # 运行测试

# 后端（server/ 目录）
cd server
pnpm dev          # 启动开发服务器
pnpm build        # TypeScript 编译

# 数据库
docker compose up -d                    # 启动 PostgreSQL
cd server && npx prisma migrate dev     # 执行迁移
cd server && npx prisma studio          # 可视化数据管理
```

## 项目结构

```
todo-app/
├── src/                    # 前端源码
│   ├── api/                # API 请求封装（auth、todos）
│   ├── hooks/              # React Query hooks
│   ├── pages/              # 页面组件（Login、Register、Todos）
│   └── App.tsx             # 根组件（页面切换 + 登录态检查）
├── server/                 # 后端（独立 package.json）
│   ├── src/
│   │   ├── routes/         # 路由（auth、todos）
│   │   ├── middlewares/    # JWT 认证中间件
│   │   └── index.ts        # Express 入口
│   └── prisma/
│       └── schema.prisma   # 数据模型定义
└── docker-compose.yml      # PostgreSQL 容器
```

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /auth/register | 注册 | 否 |
| POST | /auth/login | 登录 | 否 |
| GET | /auth/me | 检查登录态 | cookie |
| POST | /auth/logout | 退出登录 | 否 |
| GET | /todos | 查询 todo 列表 | cookie |
| POST | /todos | 创建 todo | cookie |
| PATCH | /todos/:id | 更新 todo | cookie |
| DELETE | /todos/:id | 删除 todo | cookie |

## 环境变量

需要配置两个 `.env` 文件（参考 `.env.example`）：

- **根目录 `.env`**：Docker PostgreSQL 的用户名、密码、数据库名
- **`server/.env`**：数据库连接串（DATABASE_URL）和 JWT 签名密钥（JWT_SECRET）

## ESLint 配置扩展

当前使用基础的 `typescript-eslint` 推荐规则。如需启用 type-aware 规则：

```js
// eslint.config.js
{
  files: ['**/*.{ts,tsx}'],
  extends: [
    tseslint.configs.recommendedTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
}
```
