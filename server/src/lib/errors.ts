export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '请先登录') {
    super(message, 401)
  }
}

export class ConflictError extends AppError {
  constructor(message = '资源已存在') {
    super(message, 409)
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404)
  }
}
