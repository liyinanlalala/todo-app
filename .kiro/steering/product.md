# 产品概述

Todo App — 全栈待办事项管理应用。

## 当前状态

前端已实现核心功能，后端尚未开发。

- Todo CRUD（添加、勾选完成、删除）已完成，数据暂存 localStorage
- 登录/注册页面 UI 已完成，认证逻辑为占位（直接跳转，未接真实接口）
- 页面路由通过 `useState` 手动切换，未引入路由库
- 服务端状态管理使用 TanStack React Query

## 目标功能

- Todo 增删改查（列表、添加、勾选完成、删除）
- 用户认证（注册/登录，JWT + bcrypt）
- 前后端分离架构（React 前端 + Express 后端 + PostgreSQL）
- 容器化部署（Docker + Docker Compose）
- CI/CD（GitHub Actions → Railway + Vercel）

## 规划路线

详见 `todo-app-roadmap.md`，共 5 个阶段：

0. 环境准备 ✅
1. 前端搭建 ✅（当前阶段）
2. Node.js 后端（Express + Prisma + PostgreSQL）
3. 容器化（Docker + Docker Compose）
4. CI/CD + 部署（GitHub Actions + Railway / Vercel）

## UI 语言

应用界面使用中文。代码注释也使用中文。
