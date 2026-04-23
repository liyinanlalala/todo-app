# 产品概述

Todo App — 全栈待办事项管理应用（中文界面）。

## 当前状态

前端核心功能已完成，后端 API 已搭建但尚未与前端对接。

### 前端（`src/`）

- Todo CRUD（添加、勾选完成、删除）已完成，数据暂存 localStorage
- 登录/注册页面 UI 已完成，认证逻辑为占位（直接跳转，未接真实接口）
- 页面路由通过 `useState` 手动切换，未引入路由库
- 服务端状态管理使用 TanStack React Query
- UI 组件库使用 Ant Design 6 + Tailwind CSS 4

### 后端（`server/`）

- Express 5 REST API 已搭建，含 auth 和 todos 两组路由
- PostgreSQL 数据库通过 Prisma 7 ORM 访问（含 User、Todo 模型）
- JWT 认证中间件已实现（Bearer token，7 天过期）
- 密码使用 bcrypt 哈希存储

### 待完成

- 前端对接后端 API（替换 localStorage 模拟层）
- 前端认证流程接入真实 JWT 接口
- Docker 容器化（目前仅有 PostgreSQL 的 docker-compose）
- CI/CD + 部署

## API 端点

| 方法   | 路径           | 说明           | 认证 |
| ------ | -------------- | -------------- | ---- |
| POST   | /auth/register | 注册           | 否   |
| POST   | /auth/login    | 登录           | 否   |
| GET    | /todos         | 查询 todo 列表 | 是   |
| POST   | /todos         | 创建 todo      | 是   |
| PATCH  | /todos/:id     | 更新 todo      | 是   |
| DELETE | /todos/:id     | 删除 todo      | 是   |
| GET    | /health        | 健康检查       | 否   |

## UI 语言

应用界面和代码注释均使用中文。
