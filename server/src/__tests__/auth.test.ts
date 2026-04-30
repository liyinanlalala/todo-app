import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'

vi.mock('../prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
    verify: vi.fn(),
  },
}))

vi.mock('../config.js', () => ({
  config: { jwtSecret: 'placeholder', databaseUrl: 'mock://db', port: 3000 },
}))

import prisma from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const mockUser = { id: 1, email: 'test@example.com', password: 'hashed_password', createdAt: new Date() }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /auth/register', () => {
  it('400 — 缺少 email', async () => {
    const res = await request(app).post('/auth/register').send({ password: '123456' })
    expect(res.status).toBe(400)
  })

  it('400 — 缺少 password', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })

  it('409 — 邮箱已注册', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com', password: '123456' })
    expect(res.status).toBe(409)
  })

  it('201 — 注册成功，写入 cookie', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com', password: '123456' })
    expect(res.status).toBe(201)
    expect(res.headers['set-cookie']).toBeDefined()
  })
})

describe('POST /auth/login', () => {
  it('400 — 缺少字段', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })

  it('401 — 用户不存在', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: '123456' })
    expect(res.status).toBe(401)
  })

  it('401 — 密码错误', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('200 — 登录成功，写入 cookie', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: '123456' })
    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
  })
})

describe('GET /auth/me', () => {
  it('401 — 无 cookie', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
  })

  it('401 — token 无效', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid') })
    const res = await request(app).get('/auth/me').set('Cookie', 'token=bad_token')
    expect(res.status).toBe(401)
  })

  it('200 — 返回用户信息', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 1 } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    const res = await request(app).get('/auth/me').set('Cookie', 'token=valid_token')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, email: 'test@example.com' })
  })
})

describe('GET /auth/me — 用户不存在', () => {
  it('404 — token 有效但用户已被删除', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 99 } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const res = await request(app).get('/auth/me').set('Cookie', 'token=valid_token')
    expect(res.status).toBe(404)
  })
})

describe('POST /auth/logout', () => {
  it('200 — 清除 cookie', async () => {
    const res = await request(app).post('/auth/logout')
    expect(res.status).toBe(200)
  })

  it('响应体包含 { message: "已退出登录" }', async () => {
    const res = await request(app).post('/auth/logout')
    expect(res.body).toEqual({ message: '已退出登录' })
  })
})

describe('响应体与细节', () => {
  it('register 响应体包含 { message: "注册成功" }', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com', password: '123456' })
    expect(res.body).toEqual({ message: '注册成功' })
  })

  it('register 使用 bcrypt 加密密码', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
    await request(app).post('/auth/register').send({ email: 'a@b.com', password: '123456' })
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
  })

  it('login 响应体包含 { message: "登录成功" }', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: '123456' })
    expect(res.body).toEqual({ message: '登录成功' })
  })

  it('login 用户不存在返回「邮箱或密码错误」', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: '123456' })
    expect(res.body).toEqual({ error: '邮箱或密码错误' })
  })

  it('login 密码错误返回「邮箱或密码错误」', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'wrong' })
    expect(res.body).toEqual({ error: '邮箱或密码错误' })
  })
})
