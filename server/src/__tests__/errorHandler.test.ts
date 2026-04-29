import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../middlewares/errorHandler.js'
import { AppError, BadRequestError } from '../lib/errors.js'

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
}

const req = {} as Request
const next = vi.fn() as unknown as NextFunction

describe('errorHandler', () => {
  it('AppError — 返回对应 statusCode 和 message', () => {
    const res = makeRes()
    errorHandler(new BadRequestError('title 不能为空'), req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'title 不能为空' })
  })

  it('AppError — 自定义 statusCode', () => {
    const res = makeRes()
    errorHandler(new AppError('自定义错误', 422), req, res, next)
    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ error: '自定义错误' })
  })

  it('未知错误 — 返回 500', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = makeRes()
    errorHandler(new Error('意外错误'), req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: '服务器内部错误' })
    consoleError.mockRestore()
  })
})
