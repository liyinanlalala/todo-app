import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// 扩展 Request 类型，挂载 userId
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization']
  if (!header) {
    res.status(401).json({ error: '未提供认证 token' })
    return
  }

  // Authorization: Bearer <token>
  const token = header.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'token 格式错误' })
    return
  }

  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET environment variable is required')

  try {
    const payload = jwt.verify(token, secret) as { userId: number }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'token 无效或已过期' })
  }
}
