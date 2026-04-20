# 定制版 Todo App Roadmap

> 适用对象：前端工程师（~2年经验），熟悉 React/TypeScript，弱项为 Node 后端、工程化构建、部署。
>
> **核心策略：** 前端部分快速过，把时间集中在 Node 后端、工程化构建、部署这三个弱项上。

---

## 技术栈

| 层级     | 技术                                                               |
| -------- | ------------------------------------------------------------------ |
| 前端     | React + TypeScript                                                 |
| 样式     | Tailwind CSS                                                       |
| 前端构建 | Vite（重点理解配置）                                               |
| 后端     | Node.js + Express                                                  |
| 数据库   | PostgreSQL                                                         |
| ORM      | Prisma                                                             |
| 认证     | JWT + bcrypt                                                       |
| 容器化   | Docker + Docker Compose（本地用 Rancher Desktop 提供 docker 引擎） |
| 部署     | Railway（后端 + DB） + Vercel（前端）                              |
| CI/CD    | GitHub Actions                                                     |

---

## Phase 0 — 环境准备（1-2天）

> 重点：搞清楚每个工具是干什么的，不要只是无脑安装。

```bash
# 安装 nvm，用它管理 Node 版本（而不是直接装 Node）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 使用最新的长期稳定版
nvm install 24
nvm use 24

# 包管理器
npm install -g pnpm

# Rancher Desktop（Mac）
# 去公司的 iDesk 下载安装，这是本地跑数据库的关键

```

**要搞懂的概念（别跳过）：**

- `nvm` vs 直接装 Node：为什么需要版本管理？
- `pnpm` vs `npm` vs `yarn`：有什么区别，为什么 pnpm 更快？
- Docker 是什么：为什么用它跑 PostgreSQL 而不是直接装？

---

## Phase 1 — 前端快速搭建（3-5天）

> 你熟悉 React/TS，这里重点放在**工程化配置**上，不只是"能跑起来"。

```bash
pnpm create vite todo-app --template react-ts
```

**初始化 Git 仓库并连接 GitHub：**

脚手架生成后立刻做版本控制，避免后面写一堆代码才想起来提交。

```bash
# 1. 本地初始化（Vite 模板自带 .gitignore，直接用）
git init
git add -A
git commit -m "chore: initial commit"

# 2. 在 GitHub 上手动建一个空仓库（不要勾选 README/.gitignore，避免和本地冲突）

# 3. 关联远程并推送
git remote add origin https://github.com/<user>/todo-app.git
git branch -M main                 # 把默认分支名改成 main
git push -u origin main            # -u 让本地 main 跟踪 origin/main，之后直接 git push 即可
```

**你需要搞懂 Vite 的这些配置（`vite.config.ts`）：**

- `proxy` 配置：开发时前端请求如何转发到后端（解决跨域）
- `build.outDir`：打包产物在哪里，为什么部署时需要它
- 环境变量：`import.meta.env.VITE_API_URL` 和 `.env` 文件的关系

**前端功能（快速实现，别在这里磨）：**

- Todo 列表、添加、勾选完成、删除
- 登录/注册页面（UI 先写死，接口后接）
- 用 React Query 管理服务端状态（不用 useEffect 手动 fetch）

---

## Phase 2 — Node.js 后端（重点，2-3周）

> 这是这次训练的核心。从零写一个真正可用的后端。

### 2.1 项目结构

```
server/
├── prisma/
│   ├── schema.prisma  # 数据模型定义
│   └── migrations/    # 迁移文件（prisma migrate dev 自动生成）
├── src/
│   ├── generated/prisma/  # Prisma 自动生成的客户端代码（不要手动改）
│   ├── routes/        # 路由定义
│   ├── controllers/   # 业务逻辑
│   ├── middlewares/   # 中间件（认证、错误处理）
│   └── index.ts       # 入口
├── prisma.config.ts   # Prisma 配置（npx prisma init 自动生成）
├── .env
├── package.json
└── tsconfig.json
```

### 2.2 Node 后端核心概念（按顺序学）

1. **Node.js 运行机制**：为什么它是单线程但能处理并发？事件循环是什么？
2. **Express 中间件模型**：`app.use()` 的执行顺序，`next()` 是干什么的
3. **错误处理中间件**：为什么要统一处理错误而不是每个路由自己 try/catch
4. **环境变量**：`.env` 文件、`dotenv` 库、为什么绝对不能把 `.env` 提交到 git

### 2.3 数据库 + Prisma（1周）

安装 Prisma（在 `server/` 目录下安装，不要装到前端项目里）：

```bash
cd server
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init          # 生成 prisma/schema.prisma 和 prisma.config.ts
```

> ⚠️ `npx prisma init` 会生成一个 `.env` 文件，里面的 `DATABASE_URL` 是默认值，需要改成你 Docker 数据库的连接串，比如 `postgresql://postgres:password@localhost:5432/todo`

用 Docker 启动 PostgreSQL（在项目根目录，不是 `server/` 下）：

```bash
# 编写 docker-compose.yml 和 .env 后执行
docker compose up -d
```

> `.env` 中定义 `POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DB`，`docker-compose.yml` 通过 `env_file: .env` 引用，避免在 yml 里硬编码密码。确保 `.env` 已加入 `.gitignore`。

Prisma 需要掌握：

- `schema.prisma` 定义模型
- `prisma migrate dev`：迁移是什么，为什么不能直接改数据库
- `prisma studio`：可视化查看数据

### 2.4 API 接口列表

每一个都要自己写，不要 copy：

```
POST   /auth/register
POST   /auth/login
GET    /todos          # 需要认证
POST   /todos          # 需要认证
PATCH  /todos/:id      # 需要认证
DELETE /todos/:id      # 需要认证
```

### 2.5 认证流程要真正理解

- JWT 的结构（header.payload.signature），为什么它是"无状态"的
- `bcrypt` 为什么不能用 MD5，哈希和加密的区别
- 认证中间件怎么写：拦截请求 → 验 token → 挂 user 到 req 上

---

## Phase 3 — 容器化（重点弱项，3-5天）

> 很多前端跳过这块，但这是真正理解"部署"的关键。

### 后端 `Dockerfile`

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### `docker-compose.yml`（本地开发用，升级版）

```yaml
services:
  db:
    image: postgres:16
    env_file:
      - .env
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  server:
    build: ./server
    depends_on:
      - db
    env_file:
      - .env
    environment:
      # 容器间通信用服务名 db 而不是 localhost
      DATABASE_URL: postgresql://postgres:password@db:5432/todo

volumes:
  pgdata:
```

**你需要搞懂：**

- 镜像 vs 容器的区别
- `depends_on` 是什么，服务启动顺序
- 为什么用 `alpine` 镜像
- `.dockerignore` 的作用（和 `.gitignore` 类似但用途不同）

---

## Phase 4 — CI/CD + 部署（重点弱项，1周）

### GitHub Actions

在 `.github/workflows/deploy.yml` 中配置：

- push 到 main 分支时自动触发
- 步骤：安装依赖 → 跑测试 → 构建 → 部署

你需要理解：

- `secrets`：敏感信息怎么在 CI 中安全使用
- `job` 和 `step` 的区别
- 为什么需要 CI 而不是手动部署

### 部署目标

| 服务      | 平台    | 关键配置                                         |
| --------- | ------- | ------------------------------------------------ |
| 前端      | Vercel  | 环境变量 `VITE_API_URL` 指向后端地址             |
| 后端 + DB | Railway | 配置 `DATABASE_URL`、端口、`NODE_ENV=production` |

**部署时最容易踩的坑（提前知道）：**

- 生产环境的 CORS 配置和开发环境不同
- 数据库连接池在生产环境要限制数量
- Railway 的 `PORT` 是动态的，要用 `process.env.PORT`

---

## 学习节奏建议

| 阶段                 | 时间   | 重心                              |
| -------------------- | ------ | --------------------------------- |
| Phase 0 环境准备     | 1-2 天 | 理解工具，不只是安装              |
| Phase 1 前端搭建     | 3-5 天 | Vite 配置、React Query            |
| Phase 2 Node 后端    | 2-3 周 | Node/Express/Prisma/JWT，最花时间 |
| Phase 3 容器化       | 3-5 天 | Docker 概念 + 实操                |
| Phase 4 CI/CD + 部署 | 1 周   | GitHub Actions + 上线             |

---

## 一条原则

**遇到不懂的配置，不要直接 copy，先问"这行是干什么的"。**

工程化和部署的知识，90% 都藏在那些你平时跳过的配置文件里。
