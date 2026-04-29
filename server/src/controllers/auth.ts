import { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'
import { getJwtSecret } from '../lib/jwt.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,   // 本地开发用 http，生产环境改为 true
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天，单位毫秒
}

export async function register(req: Request, res: Response) {
  const { email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: '该邮箱已注册' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.status(201).json({ message: '注册成功' })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
  }

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTIONS)
  res.json({ message: '登录成功' })
}

// requireAuth 中间件已验证 token 并挂载 req.userId，这里只需查用户信息
export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true },
  })
  if (!user) {
    res.status(401).json({ error: '用户不存在' })
    return
  }
  res.json(user)
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token')
  res.json({ message: '已退出登录' })
}
