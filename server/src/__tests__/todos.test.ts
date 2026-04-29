import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'

vi.mock('../prisma.js', () => ({
  default: {
    todo: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
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

import { Prisma } from '../generated/prisma/client.js'
import prisma from '../prisma.js'
import jwt from 'jsonwebtoken'

function makePrismaNotFoundError() {
  return new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: '7.0.0',
  })
}

const AUTH_COOKIE = 'token=valid_token'
const mockTodo = { id: 1, title: 'Test todo', completed: false, userId: 1, createdAt: new Date() }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(jwt.verify).mockReturnValue({ userId: 1 } as never)
})

describe('GET /todos', () => {
  it('401 — 未认证', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error() })
    const res = await request(app).get('/todos')
    expect(res.status).toBe(401)
  })

  it('200 — 返回列表', async () => {
    vi.mocked(prisma.todo.findMany).mockResolvedValue([mockTodo])
    const res = await request(app).get('/todos').set('Cookie', AUTH_COOKIE)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('POST /todos', () => {
  it('401 — 未认证', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error() })
    const res = await request(app).post('/todos').send({ title: 'hello' })
    expect(res.status).toBe(401)
  })

  it('400 — title 为空白', async () => {
    const res = await request(app).post('/todos').set('Cookie', AUTH_COOKIE).send({ title: '   ' })
    expect(res.status).toBe(400)
  })

  it('400 — 缺少 title', async () => {
    const res = await request(app).post('/todos').set('Cookie', AUTH_COOKIE).send({})
    expect(res.status).toBe(400)
  })

  it('400 — title 不是字符串', async () => {
    const res = await request(app).post('/todos').set('Cookie', AUTH_COOKIE).send({ title: 123 })
    expect(res.status).toBe(400)
  })

  it('201 — 创建成功', async () => {
    vi.mocked(prisma.todo.create).mockResolvedValue(mockTodo)
    const res = await request(app).post('/todos').set('Cookie', AUTH_COOKIE).send({ title: 'hello' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: 'Test todo' })
  })
})

describe('PATCH /todos/:id', () => {
  it('401 — 未认证', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error() })
    const res = await request(app).patch('/todos/1').send({ completed: true })
    expect(res.status).toBe(401)
  })

  it('400 — completed 不是布尔值', async () => {
    const res = await request(app).patch('/todos/1').set('Cookie', AUTH_COOKIE).send({ completed: 'yes' })
    expect(res.status).toBe(400)
  })

  it('200 — 更新成功', async () => {
    vi.mocked(prisma.todo.update).mockResolvedValue({ ...mockTodo, completed: true })
    const res = await request(app).patch('/todos/1').set('Cookie', AUTH_COOKIE).send({ completed: true })
    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
  })

  it('404 — todo 不存在', async () => {
    vi.mocked(prisma.todo.update).mockRejectedValue(makePrismaNotFoundError())
    const res = await request(app).patch('/todos/999').set('Cookie', AUTH_COOKIE).send({ completed: true })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /todos/:id', () => {
  it('401 — 未认证', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error() })
    const res = await request(app).delete('/todos/1')
    expect(res.status).toBe(401)
  })

  it('204 — 删除成功', async () => {
    vi.mocked(prisma.todo.delete).mockResolvedValue(mockTodo)
    const res = await request(app).delete('/todos/1').set('Cookie', AUTH_COOKIE)
    expect(res.status).toBe(204)
  })

  it('404 — todo 不存在', async () => {
    vi.mocked(prisma.todo.delete).mockRejectedValue(makePrismaNotFoundError())
    const res = await request(app).delete('/todos/999').set('Cookie', AUTH_COOKIE)
    expect(res.status).toBe(404)
  })
})
