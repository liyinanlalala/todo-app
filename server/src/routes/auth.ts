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

  res.status(201).json({ token })
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

  res.json({ token })
})

export default router
