import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { UnauthorizedError } from '../lib/errors.js'

// 扩展 Request 类型，挂载 userId
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.['token']
  if (!token) {
    throw new UnauthorizedError('未提供认证 token')
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number }
    req.userId = payload.userId
    next()
  } catch {
    throw new UnauthorizedError('token 无效或已过期')
  }
}
