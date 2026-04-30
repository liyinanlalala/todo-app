import { login, register, logout, checkAuth } from '../auth'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('login', () => {
  it('登录成功返回 message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: '登录成功' }), { status: 200 }),
    )
    const res = await login('a@b.com', '123456')
    expect(res.message).toBe('登录成功')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('凭据错误抛出错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '邮箱或密码错误' }), { status: 401 }),
    )
    await expect(login('a@b.com', 'wrong')).rejects.toThrow('邮箱或密码错误')
  })
})

describe('register', () => {
  it('注册成功返回 message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: '注册成功' }), { status: 201 }),
    )
    const res = await register('a@b.com', '123456')
    expect(res.message).toBe('注册成功')
  })

  it('邮箱已注册抛出错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '该邮箱已注册' }), { status: 409 }),
    )
    await expect(register('a@b.com', '123456')).rejects.toThrow('该邮箱已注册')
  })
})

describe('logout', () => {
  it('退出成功返回 message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: '已退出登录' }), { status: 200 }),
    )
    const res = await logout()
    expect(res.message).toBe('已退出登录')
  })

  it('不携带请求体', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: '已退出登录' }), { status: 200 }),
    )
    await logout()
    const [, options] = fetchSpy.mock.calls[0]
    expect((options as RequestInit).body).toBeUndefined()
  })
})

describe('checkAuth', () => {
  it('已登录返回用户信息', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, email: 'a@b.com' }), { status: 200 }),
    )
    const user = await checkAuth()
    expect(user).toEqual({ id: 1, email: 'a@b.com' })
  })

  it('未登录抛出错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '未登录' }), { status: 401 }),
    )
    await expect(checkAuth()).rejects.toThrow('未登录')
  })
})

describe('错误处理边界', () => {
  it('响应体无 error 字段时使用默认错误信息「请求失败」', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 }),
    )
    await expect(login('a@b.com', '123456')).rejects.toThrow('请求失败')
  })

  it('网络异常时错误向上传播', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(login('a@b.com', '123456')).rejects.toThrow('Failed to fetch')
  })
})
