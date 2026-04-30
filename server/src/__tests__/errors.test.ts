import { describe, it, expect } from 'vitest'
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../lib/errors.js'

describe('AppError', () => {
  it('携带自定义 statusCode 和 message', () => {
    const err = new AppError('自定义错误', 422)
    expect(err.statusCode).toBe(422)
    expect(err.message).toBe('自定义错误')
  })
})

describe('BadRequestError', () => {
  it('默认 statusCode=400 和默认消息', () => {
    const err = new BadRequestError()
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('请求参数错误')
  })

  it('自定义消息覆盖默认值', () => {
    const err = new BadRequestError('title 不能为空')
    expect(err.message).toBe('title 不能为空')
    expect(err.statusCode).toBe(400)
  })
})

describe('UnauthorizedError', () => {
  it('默认 statusCode=401 和默认消息', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.message).toBe('请先登录')
  })
})

describe('ConflictError', () => {
  it('默认 statusCode=409 和默认消息', () => {
    const err = new ConflictError()
    expect(err.statusCode).toBe(409)
    expect(err.message).toBe('资源已存在')
  })
})

describe('NotFoundError', () => {
  it('默认 statusCode=404 和默认消息', () => {
    const err = new NotFoundError()
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('资源不存在')
  })
})

describe('继承关系', () => {
  it('所有子类均为 AppError 和 Error 的实例', () => {
    const errors = [
      new BadRequestError(),
      new UnauthorizedError(),
      new ConflictError(),
      new NotFoundError(),
    ]
    for (const err of errors) {
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(Error)
    }
  })
})
