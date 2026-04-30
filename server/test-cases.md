# 测试用例（后端）

## 错误类（src/lib/errors.ts）

### P0 — 各类错误的 statusCode 与默认消息

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-ERR-001 | new AppError('自定义', 422) | statusCode=422, message='自定义' | ✅ |
| S-ERR-002 | new BadRequestError() | statusCode=400, message='请求参数错误' | ✅ |
| S-ERR-003 | new UnauthorizedError() | statusCode=401, message='请先登录' | ✅ |
| S-ERR-004 | new ConflictError() | statusCode=409, message='资源已存在' | ✅ |
| S-ERR-005 | new NotFoundError() | statusCode=404, message='资源不存在' | ✅ |

### P1 — 继承与覆盖

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-ERR-006 | new BadRequestError('自定义消息') | 使用自定义消息覆盖默认值 | ✅ |
| S-ERR-007 | 各子类 instanceof 检查 | 均为 AppError 和 Error 的实例 | ✅ |

---

## 错误处理中间件（src/middlewares/errorHandler.ts）

### P0 — 错误分类处理

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-EH-001 | 传入 BadRequestError | 响应 400 + 对应 message | ✅ |
| S-EH-002 | 传入 AppError(msg, 422) | 响应 422 + 对应 message | ✅ |
| S-EH-003 | 传入普通 Error | 响应 500 +「服务器内部错误」，console.error 输出 | ✅ |

---

## 配置模块（src/config.ts）

### P0 — 环境变量读取

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-CFG-001 | DATABASE_URL 未设置 | 抛出「环境变量 DATABASE_URL 未配置」 | ✅ |
| S-CFG-002 | JWT_SECRET 未设置 | 抛出「环境变量 JWT_SECRET 未配置」 | ✅ |
| S-CFG-003 | PORT 未设置 | 默认 3000 | ✅ |
| S-CFG-004 | 全部环境变量正常设置 | 返回正确的 config 对象 | ✅ |

---

## 认证中间件（src/middlewares/auth.ts）

### P0 — Token 校验

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-MW-001 | 请求无 cookie | 抛出 UnauthorizedError「未提供认证 token」 | ✅ |
| S-MW-002 | token 无效或过期 | 抛出 UnauthorizedError「token 无效或已过期」 | ✅ |
| S-MW-003 | token 有效 | req.userId 被挂载，next() 被调用 | ✅ |

---

## Auth API（src/controllers/auth.ts + routes）

### P0 — 核心流程

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-AUTH-001 | register 缺少 email | 400 | ✅ |
| S-AUTH-002 | register 缺少 password | 400 | ✅ |
| S-AUTH-003 | register 邮箱已注册 | 409 | ✅ |
| S-AUTH-004 | register 成功 | 201 + Set-Cookie | ✅ |
| S-AUTH-005 | login 缺少字段 | 400 | ✅ |
| S-AUTH-006 | login 用户不存在 | 401 | ✅ |
| S-AUTH-007 | login 密码错误 | 401 | ✅ |
| S-AUTH-008 | login 成功 | 200 + Set-Cookie | ✅ |
| S-AUTH-009 | me 无 cookie | 401 | ✅ |
| S-AUTH-010 | me token 无效 | 401 | ✅ |
| S-AUTH-011 | me 返回用户信息 | 200 + { id, email } | ✅ |
| S-AUTH-012 | logout | 200 | ✅ |

### P1 — 响应体与细节

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-AUTH-013 | me token 有效但用户已删除 | 404 | ✅ |
| S-AUTH-014 | register 响应体 | { message: '注册成功' } | ✅ |
| S-AUTH-015 | register 密码加密 | bcrypt.hash 被调用 | ✅ |
| S-AUTH-016 | login 响应体 | { message: '登录成功' } | ✅ |
| S-AUTH-017 | login 用户不存在的错误信息 | { error: '邮箱或密码错误' } | ✅ |
| S-AUTH-018 | login 密码错误的错误信息 | { error: '邮箱或密码错误' } | ✅ |
| S-AUTH-019 | logout 响应体 | { message: '已退出登录' } | ✅ |

---

## Todos API（src/controllers/todos.ts + routes）

### P0 — 核心 CRUD

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-TODO-001 | GET /todos 未认证 | 401 | ✅ |
| S-TODO-002 | GET /todos 返回列表 | 200 + 数组 | ✅ |
| S-TODO-003 | POST /todos 未认证 | 401 | ✅ |
| S-TODO-004 | POST /todos title 为空白 | 400 | ✅ |
| S-TODO-005 | POST /todos 缺少 title | 400 | ✅ |
| S-TODO-006 | POST /todos title 不是字符串 | 400 | ✅ |
| S-TODO-007 | POST /todos 创建成功 | 201 + todo 对象 | ✅ |
| S-TODO-008 | PATCH /todos/:id 未认证 | 401 | ✅ |
| S-TODO-009 | PATCH /todos/:id completed 不是布尔值 | 400 | ✅ |
| S-TODO-010 | PATCH /todos/:id 更新成功 | 200 + 更新后 todo | ✅ |
| S-TODO-011 | PATCH /todos/:id todo 不存在 | 404 | ✅ |
| S-TODO-012 | DELETE /todos/:id 未认证 | 401 | ✅ |
| S-TODO-013 | DELETE /todos/:id 删除成功 | 204 | ✅ |
| S-TODO-014 | DELETE /todos/:id todo 不存在 | 404 | ✅ |

### P1 — 边界与细节

| 编号 | 用例 | 预期结果 | 自动化 |
|------|------|----------|--------|
| S-TODO-015 | GET /todos 无数据 | 200 + 空数组 | ✅ |
| S-TODO-016 | POST /todos title 前后有空格 | 自动 trim 后存储 | ✅ |
| S-TODO-017 | PATCH /todos/:id completed 非布尔值的错误信息 | { error: 'completed 必须为布尔值' } | ✅ |
| S-TODO-018 | DELETE /todos/:id 成功无响应体 | body 为空 | ✅ |

---

## 统计

| 级别 | 总数 | 已自动化 |
|------|------|----------|
| P0   | 35   | 35       |
| P1   | 18   | 18       |
| **合计** | **53** | **53** |
