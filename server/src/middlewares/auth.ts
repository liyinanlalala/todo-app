import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '../lib/jwt.js'

// 扩展 Request 类型，挂载 userId
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.['token']
  if (!token) {
    res.status(401).json({ error: '未提供认证 token' })
    return
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: number }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'token 无效或已过期' })
  }
}
