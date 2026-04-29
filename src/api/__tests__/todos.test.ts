import { listTodos, createTodo, updateTodo, deleteTodo } from '../todos'

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
})
