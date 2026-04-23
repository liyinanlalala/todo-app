# 产品概述

Todo App — 全栈待办事项管理应用（中文界面）。

## 当前状态

前后端已对接，核心功能可用。

### 前端（`src/`）

- Todo CRUD（添加、勾选完成、删除）已完成，通过 REST API 与后端通信
- 登录/注册/退出已接入真实 JWT 接口，启动时通过 `/auth/me` 检查登录态
- 页面路由通过 `useState` 手动切换（login / register / todos），未引入路由库
- 服务端状态管理使用 TanStack React Query
- UI 组件库使用 Ant Design 6 + Tailwind CSS 4

### 后端（`server/`）

- Express 5 REST API，含 auth 和 todos 两组路由
- PostgreSQL 数据库通过 Prisma 7 ORM 访问（User、Todo 模型）
- 认证方式：httpOnly cookie 存储 JWT（7 天过期），非 Authorization header
- 密码使用 bcrypt 哈希存储（salt rounds = 10）

### 待完成

- Docker 容器化（目前仅有 PostgreSQL 的 docker-compose）
- CI/CD + 部署
- 生产环境 cookie `secure: true` 配置

## API 端点

| 方法   | 路径           | 说明           | 认证 |
| ------ | -------------- | -------------- | ---- |
| POST   | /auth/register | 注册           | 否   |
| POST   | /auth/login    | 登录           | 否   |
| GET    | /auth/me       | 检查登录态     | 否\* |
| POST   | /auth/logout   | 退出登录       | 否   |
| GET    | /todos         | 查询 todo 列表 | 是   |
| POST   | /todos         | 创建 todo      | 是   |
| PATCH  | /todos/:id     | 更新 todo      | 是   |
| DELETE | /todos/:id     | 删除 todo      | 是   |
| GET    | /health        | 健康检查       | 否   |

\*`/auth/me` 读取 cookie 中的 token，无 token 返回 401。

## UI 语言

应用界面和代码注释均使用中文。
