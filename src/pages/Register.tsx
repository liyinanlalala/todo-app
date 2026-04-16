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
    <main className="max-w-sm mx-auto mt-20 p-8 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      <h1 className="mb-6 text-2xl font-medium text-center text-gray-900 dark:text-gray-100">注册</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          邮箱
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          确认密码
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className="px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="mt-1 px-5 py-3 text-base rounded-md bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-colors"
        >
          创建账号
        </button>
      </form>
      <p className="mt-6 text-center text-gray-500 text-sm">
        已有账号?{' '}
        <button
          type="button"
          className="bg-transparent border-none text-blue-500 cursor-pointer text-sm p-0 underline hover:text-blue-600"
          onClick={onSwitchToLogin}
        >
          去登录
        </button>
      </p>
    </main>
  )
}

export default Register
