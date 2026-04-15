import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Todos from './pages/Todos'
import './App.css'

type Page = 'login' | 'register' | 'todos'

function App() {
  const [page, setPage] = useState<Page>('login')

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
