import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}))

vi.mock('../config.js', () => ({
  config: { jwtSecret: 'test-secret', databaseUrl: 'mock://db', port: 3000 },
}))

import jwt from 'jsonwebtoken'
import { requireAuth } from '../middlewares/auth.js'
import { UnauthorizedError } from '../lib/errors.js'

function makeReq(cookies: Record<string, string> = {}): Request {
  return { cookies } as unknown as Request
}

const res = {} as Response
const next = vi.fn() as unknown as NextFunction

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAuth', () => {
  it('无 cookie 抛出 UnauthorizedError「未提供认证 token」', () => {
    expect(() => requireAuth(makeReq(), res, next)).toThrow(UnauthorizedError)
    expect(() => requireAuth(makeReq(), res, next)).toThrow('未提供认证 token')
  })

  it('token 无效抛出 UnauthorizedError「token 无效或已过期」', () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid') })
    expect(() => requireAuth(makeReq({ token: 'bad' }), res, next)).toThrow(UnauthorizedError)
    expect(() => requireAuth(makeReq({ token: 'bad' }), res, next)).toThrow('token 无效或已过期')
  })

  it('token 有效时挂载 req.userId 并调用 next()', () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 42 } as never)
    const req = makeReq({ token: 'valid' })
    requireAuth(req, res, next)
    expect(req.userId).toBe(42)
    expect(next).toHaveBeenCalledOnce()
  })
})
