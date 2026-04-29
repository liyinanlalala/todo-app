import { useEffect, useState } from 'react'
import { Spin, Flex } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import Login from './pages/Login'
import Register from './pages/Register'
import Todos from './pages/Todos'
import { checkAuth } from './api/auth'
import { SESSION_EXPIRED_EVENT } from './lib/events'

type Page = 'login' | 'register' | 'todos'

function App() {
  const qc = useQueryClient()
  const [page, setPage] = useState<Page | null>(null)

  // 启动时检查是否已登录
  useEffect(() => {
    checkAuth()
      .then(() => setPage('todos'))
      .catch(() => setPage('login'))
  }, [])

  // cookie 过期时，todo 接口收到 401 会触发此事件，清除缓存并跳回登录页
  useEffect(() => {
    const handler = () => {
      qc.clear()
      setPage('login')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  }, [qc])

  // 检查登录态期间显示加载状态
  if (page === null) {
    return (
      <Flex justify="center" align="center" className="h-screen">
        <Spin size="large" />
      </Flex>
    )
  }

  if (page === 'login') {
    return (
      <Login
        onSuccess={() => setPage('todos')}
        onSwitchToRegister={() => setPage('register')}
      />
    )
  }

  if (page === 'register') {
    return (
      <Register
        onSuccess={() => setPage('todos')}
        onSwitchToLogin={() => setPage('login')}
      />
    )
  }

  return <Todos onLogout={() => setPage('login')} />
}

export default App
