import { type Router as RouterType, Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'

const router: RouterType = Router()

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return secret
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body

  // 检查邮箱是否已注册
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: '该邮箱已注册' })
    return
  }

  // bcrypt 哈希密码，10 是 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,     // JS 无法读取，防 XSS
    secure: false,      // 本地开发用 http，生产环境改为 true
    sameSite: 'lax',    // 防 CSRF：仅同站请求或顶级导航时携带
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天，单位毫秒，和 JWT 过期时间一致
  })
  res.status(201).json({ message: '注册成功' })
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
  }

  // 比对密码：把用户输入的明文和数据库里的哈希值比较
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: '邮箱或密码错误' })
    return
  }

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ message: '登录成功' })
})

// GET /auth/me — 检查当前登录态，返回用户信息
router.get('/me', async (req, res) => {
  const token = req.cookies?.['token']
  if (!token) {
    res.status(401).json({ error: '未登录' })
    return
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: number }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    })
    if (!user) {
      res.status(401).json({ error: '用户不存在' })
      return
    }
    res.json(user)
  } catch {
    res.status(401).json({ error: 'token 无效或已过期' })
  }
})

// POST /auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ message: '已退出登录' })
})

export default router
