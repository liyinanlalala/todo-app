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
    <main className="todo-app">
      <div className="todo-header">
        <h1>Todos</h1>
        <button type="button" className="link-btn" onClick={onLogout}>
          退出登录
        </button>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="要做点什么?"
          aria-label="新 todo 内容"
          disabled={addMutation.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || addMutation.isPending}
        >
          {addMutation.isPending ? '添加中…' : '添加'}
        </button>
      </form>

      {isPending && <p className="empty">加载中…</p>}

      {isError && (
        <p className="form-error">加载失败:{error.message}</p>
      )}

      {!isPending && !isError && todos.length === 0 && (
        <p className="empty">还没有任何任务,加一个吧。</p>
      )}

      {!isPending && !isError && todos.length > 0 && (
        <>
          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={todo.completed ? 'todo-item done' : 'todo-item'}
              >
                <label>
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
                  <span>{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteMutation.mutate(todo.id)}
                  aria-label={`删除 ${todo.text}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="summary">
            剩余 {todos.filter((t) => !t.completed).length} 项
          </p>
        </>
      )}
    </main>
  )
}

export default Todos
