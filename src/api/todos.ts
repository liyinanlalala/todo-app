import type { Todo } from '../types'

const STORAGE_KEY = 'todo-app:todos'
const LATENCY_MS = 200

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

function read(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Todo[]) : []
  } catch {
    return []
  }
}

function write(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function listTodos(): Promise<Todo[]> {
  return delay(read())
}

export function createTodo(text: string): Promise<Todo> {
  const trimmed = text.trim()
  if (!trimmed) return Promise.reject(new Error('内容不能为空'))
  const todo: Todo = {
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
  }
  const next = [...read(), todo]
  write(next)
  return delay(todo)
}

export function updateTodo(
  id: string,
  patch: Partial<Pick<Todo, 'text' | 'completed'>>,
): Promise<Todo> {
  const todos = read()
  const idx = todos.findIndex((t) => t.id === id)
  if (idx === -1) return Promise.reject(new Error('Todo 不存在'))
  const updated = { ...todos[idx], ...patch }
  const next = todos.map((t) => (t.id === id ? updated : t))
  write(next)
  return delay(updated)
}

export function deleteTodo(id: string): Promise<void> {
  const next = read().filter((t) => t.id !== id)
  write(next)
  return delay(undefined)
}
