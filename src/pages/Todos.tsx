import { useState, type FormEvent } from 'react'
import { useTodos } from '../useTodos'

type Props = {
  onLogout: () => void
}

function Todos({ onLogout }: Props) {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos()
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addTodo(input)
    setInput('')
  }

  const remaining = todos.filter((t) => !t.completed).length

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
        />
        <button type="submit" disabled={!input.trim()}>
          添加
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="empty">还没有任何任务,加一个吧。</p>
      ) : (
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
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`删除 ${todo.text}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="summary">剩余 {remaining} 项</p>
        </>
      )}
    </main>
  )
}

export default Todos
