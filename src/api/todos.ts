import type { Todo } from '../types'
import { SESSION_EXPIRED_EVENT } from '../lib/events'

const API_BASE = 'http://localhost:3000'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
    throw new Error('登录已过期，请重新登录')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(data.error ?? '请求失败')
  }

  // 204 No Content（删除接口）
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export function listTodos(): Promise<Todo[]> {
  return request<Todo[]>('/todos')
}

export function createTodo(title: string): Promise<Todo> {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(
  id: number,
  patch: Partial<Pick<Todo, 'title' | 'completed'>>,
): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteTodo(id: number): Promise<void> {
  return request<void>(`/todos/${id}`, {
    method: 'DELETE',
  })
}
