import { listTodos, createTodo, updateTodo, deleteTodo } from '../todos'

beforeEach(() => {
  localStorage.clear()
})

describe('listTodos', () => {
  it('空 localStorage 返回空数组', async () => {
    const todos = await listTodos()
    expect(todos).toEqual([])
  })

  it('返回已存储的 todos', async () => {
    const stored = [{ id: '1', text: '测试', completed: false }]
    localStorage.setItem('todo-app:todos', JSON.stringify(stored))
    const todos = await listTodos()
    expect(todos).toEqual(stored)
  })

  it('损坏的 JSON 返回空数组', async () => {
    localStorage.setItem('todo-app:todos', '{invalid')
    const todos = await listTodos()
    expect(todos).toEqual([])
  })

  it('非数组值返回空数组', async () => {
    localStorage.setItem('todo-app:todos', JSON.stringify({ not: 'array' }))
    const todos = await listTodos()
    expect(todos).toEqual([])
  })
})

describe('createTodo', () => {
  it('创建并持久化新 todo', async () => {
    const todo = await createTodo('买牛奶')
    expect(todo.text).toBe('买牛奶')
    expect(todo.completed).toBe(false)
    expect(todo.id).toBeDefined()

    const stored = JSON.parse(localStorage.getItem('todo-app:todos')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('买牛奶')
  })

  it('自动去除首尾空格', async () => {
    const todo = await createTodo('  有空格  ')
    expect(todo.text).toBe('有空格')
  })

  it('空字符串抛出错误', async () => {
    await expect(createTodo('')).rejects.toThrow('内容不能为空')
  })

  it('纯空格字符串抛出错误', async () => {
    await expect(createTodo('   ')).rejects.toThrow('内容不能为空')
  })
})

describe('updateTodo', () => {
  it('更新 completed 状态', async () => {
    const todo = await createTodo('任务')
    const updated = await updateTodo(todo.id, { completed: true })
    expect(updated.completed).toBe(true)
    expect(updated.text).toBe('任务')
  })

  it('更新 text', async () => {
    const todo = await createTodo('旧文本')
    const updated = await updateTodo(todo.id, { text: '新文本' })
    expect(updated.text).toBe('新文本')
  })

  it('不存在的 id 抛出错误', async () => {
    await expect(updateTodo('nonexistent', { completed: true })).rejects.toThrow(
      'Todo 不存在',
    )
  })
})

describe('deleteTodo', () => {
  it('删除指定 todo', async () => {
    const todo = await createTodo('要删除')
    await deleteTodo(todo.id)
    const todos = await listTodos()
    expect(todos).toHaveLength(0)
  })

  it('删除不存在的 id 不报错', async () => {
    await createTodo('保留')
    await expect(deleteTodo('nonexistent')).resolves.toBeUndefined()
    const todos = await listTodos()
    expect(todos).toHaveLength(1)
  })
})
