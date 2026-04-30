import { describe, it, expect, vi, beforeEach } from 'vitest'

// 阻止 dotenv 加载 .env 文件，确保测试完全控制环境变量
vi.mock('dotenv/config', () => ({}))

beforeEach(() => {
  vi.resetModules()
})

describe('config', () => {
  it('DATABASE_URL 未设置时抛出错误', async () => {
    const saved = process.env['DATABASE_URL']
    delete process.env['DATABASE_URL']
    try {
      await expect(import('../config.js')).rejects.toThrow('环境变量 DATABASE_URL 未配置')
    } finally {
      process.env['DATABASE_URL'] = saved
    }
  })

  it('JWT_SECRET 未设置时抛出错误', async () => {
    const savedDb = process.env['DATABASE_URL']
    const savedJwt = process.env['JWT_SECRET']
    process.env['DATABASE_URL'] = 'postgresql://test'
    delete process.env['JWT_SECRET']
    try {
      await expect(import('../config.js')).rejects.toThrow('环境变量 JWT_SECRET 未配置')
    } finally {
      process.env['DATABASE_URL'] = savedDb
      process.env['JWT_SECRET'] = savedJwt
    }
  })

  it('PORT 未设置时默认 3000', async () => {
    const savedDb = process.env['DATABASE_URL']
    const savedJwt = process.env['JWT_SECRET']
    const savedPort = process.env['PORT']
    process.env['DATABASE_URL'] = 'postgresql://test'
    process.env['JWT_SECRET'] = 'secret'
    delete process.env['PORT']
    try {
      const { config } = await import('../config.js')
      expect(config.port).toBe(3000)
    } finally {
      process.env['DATABASE_URL'] = savedDb
      process.env['JWT_SECRET'] = savedJwt
      process.env['PORT'] = savedPort
    }
  })

  it('全部环境变量正常设置时返回正确的 config 对象', async () => {
    const savedDb = process.env['DATABASE_URL']
    const savedJwt = process.env['JWT_SECRET']
    const savedPort = process.env['PORT']
    process.env['DATABASE_URL'] = 'postgresql://test'
    process.env['JWT_SECRET'] = 'my-secret'
    process.env['PORT'] = '4000'
    try {
      const { config } = await import('../config.js')
      expect(config.databaseUrl).toBe('postgresql://test')
      expect(config.jwtSecret).toBe('my-secret')
      expect(config.port).toBe(4000)
    } finally {
      process.env['DATABASE_URL'] = savedDb
      process.env['JWT_SECRET'] = savedJwt
      process.env['PORT'] = savedPort
    }
  })
})
