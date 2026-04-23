import { useEffect, useState } from 'react'
import { Spin, Flex } from 'antd'
import Login from './pages/Login'
import Register from './pages/Register'
import Todos from './pages/Todos'
import { checkAuth } from './api/auth'

type Page = 'login' | 'register' | 'todos'

function App() {
  const [page, setPage] = useState<Page | null>(null)

  // 启动时检查是否已登录
  useEffect(() => {
    checkAuth()
      .then(() => setPage('todos'))
      .catch(() => setPage('login'))
  }, [])

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
