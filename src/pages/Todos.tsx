import { useState, type FormEvent } from 'react'
import {
  useAddTodo,
  useDeleteTodo,
  useToggleTodo,
  useTodosQuery,
} from '../hooks/useTodosQuery'

type Props = {
  onLogout: () => void
}

function Todos({ onLogout }: Props) {
  const { data: todos, isPending, isError, error } = useTodosQuery()
  const addMutation = useAddTodo()
  const toggleMutation = useToggleTodo()
  const deleteMutation = useDeleteTodo()
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    addMutation.mutate(trimmed, {
      onSuccess: () => setInput(''),
    })
  }

  return (
    <main className="max-w-lg mx-auto mt-12 p-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-3xl font-medium text-gray-900 dark:text-gray-100">Todos</h1>
        <button
          type="button"
          className="bg-transparent border-none text-blue-500 cursor-pointer underline hover:text-blue-600"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>

      <form className="flex gap-2 mb-6" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="要做点什么?"
          aria-label="新 todo 内容"
          disabled={addMutation.isPending}
          className="flex-1 px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || addMutation.isPending}
          className="px-5 py-2.5 text-base rounded-md bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {addMutation.isPending ? '添加中…' : '添加'}
        </button>
      </form>

      {isPending && <p className="text-gray-500 text-center py-8">加载中…</p>}

      {isError && (
        <p className="text-red-500 text-sm">加载失败：{error.message}</p>
      )}

      {!isPending && !isError && todos.length === 0 && (
        <p className="text-gray-500 text-center py-8">还没有任何任务，加一个吧。</p>
      )}

      {!isPending && !isError && todos.length > 0 && (
        <>
          <ul className="list-none p-0 m-0">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between py-2.5 px-1 border-b border-gray-100 dark:border-gray-700"
              >
                <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() =>
                      toggleMutation.mutate({
                        id: todo.id,
                        completed: !todo.completed,
                      })
                    }
                  />
                  <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                    {todo.text}
                  </span>
                </label>
                <button
                  type="button"
                  className="bg-transparent border-none text-red-500 text-xl cursor-pointer px-1.5 hover:text-red-600"
                  onClick={() => deleteMutation.mutate(todo.id)}
                  aria-label={`删除 ${todo.text}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-500 text-sm">
            剩余 {todos.filter((t) => !t.completed).length} 项
          </p>
        </>
      )}
    </main>
  )
}

export default Todos
