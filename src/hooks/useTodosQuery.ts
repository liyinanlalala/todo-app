import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from '../api/todos'

const TODOS_KEY = ['todos'] as const

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: listTodos,
  })
}

export function useAddTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => createTodo(text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })
}

export function useToggleTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY })
    },
  })
}
