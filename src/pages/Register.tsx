import { useState, type FormEvent } from 'react'

type Props = {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

function Register({ onSuccess, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    setError(null)
    // TODO: 接入真实注册接口
    onSuccess()
  }

  return (
    <main className="auth-card">
      <h1>注册</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          邮箱
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          确认密码
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">创建账号</button>
      </form>
      <p className="auth-switch">
        已有账号?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          去登录
        </button>
      </p>
    </main>
  )
}

export default Register
