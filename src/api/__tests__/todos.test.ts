import { listTodos, createTodo, updateTodo, deleteTodo } from '../todos'
import { SESSION_EXPIRED_EVENT } from '../../lib/events'

const mockTodo = { id: 1, title: '测试', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('listTodos', () => {
  it('返回 todo 列表', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockTodo]), { status: 200 }),
    )
    const todos = await listTodos()
    expect(todos).toEqual([mockTodo])
  })

  it('401 抛出登录过期错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '未提供认证 token' }), { status: 401 }),
    )
    await expect(listTodos()).rejects.toThrow('登录已过期，请重新登录')
  })

  it('其他错误抛出响应体中的 error 信息', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '服务器内部错误' }), { status: 500 }),
    )
    await expect(listTodos()).rejects.toThrow('服务器内部错误')
  })
})

describe('createTodo', () => {
  it('创建新 todo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockTodo), { status: 201 }),
    )
    const todo = await createTodo('测试')
    expect(todo).toEqual(mockTodo)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/todos'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: '测试' }),
      }),
    )
  })
})

describe('updateTodo', () => {
  it('更新 completed 状态', async () => {
    const updated = { ...mockTodo, completed: true }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(updated), { status: 200 }),
    )
    const result = await updateTodo(1, { completed: true })
    expect(result.completed).toBe(true)
  })
})

describe('deleteTodo', () => {
  it('删除 todo 返回 undefined', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )
    await expect(deleteTodo(1)).resolves.toBeUndefined()
  })

  it('500 错误抛出响应体中的 error 信息', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '服务器内部错误' }), { status: 500 }),
    )
    await expect(deleteTodo(1)).rejects.toThrow('服务器内部错误')
  })
})

describe('401 认证过期', () => {
  it('401 响应触发 SESSION_EXPIRED_EVENT', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '未提供认证 token' }), { status: 401 }),
    )
    const handler = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    try {
      await listTodos().catch(() => {})
      expect(handler).toHaveBeenCalledOnce()
    } finally {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
    }
  })

  it('createTodo 401 抛出登录过期错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: '未提供认证 token' }), { status: 401 }),
    )
    await expect(createTodo('测试')).rejects.toThrow('登录已过期，请重新登录')
  })
})

describe('错误处理边界', () => {
  it('响应体无 error 字段时使用默认错误信息「请求失败」', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 500 }),
    )
    await expect(listTodos()).rejects.toThrow('请求失败')
  })
})

describe('updateTodo 多字段', () => {
  it('同时更新 title 和 completed', async () => {
    const updated = { ...mockTodo, title: '更新后', completed: true }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(updated), { status: 200 }),
    )
    const result = await updateTodo(1, { title: '更新后', completed: true })
    expect(result).toEqual(updated)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/todos/1'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: '更新后', completed: true }),
      }),
    )
  })
})
