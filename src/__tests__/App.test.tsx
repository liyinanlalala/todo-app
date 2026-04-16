import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
  return { user }
}

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('默认显示登录页', () => {
    setup()
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()
  })

  it('从登录页切换到注册页', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: '去注册' }))
    expect(screen.getByRole('heading', { name: '注册' })).toBeInTheDocument()
  })

  it('从注册页切换回登录页', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: '去注册' }))
    await user.click(screen.getByRole('button', { name: '去登录' }))
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()
  })

  it('登录成功后进入 Todos 页', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.click(screen.getByRole('button', { name: '登录' }))
    expect(
      await screen.findByRole('heading', { name: 'Todos' }),
    ).toBeInTheDocument()
  })

  it('注册成功后进入 Todos 页', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: '去注册' }))
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.type(screen.getByLabelText('确认密码'), '123456')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(
      await screen.findByRole('heading', { name: 'Todos' }),
    ).toBeInTheDocument()
  })

  it('登录→添加 todo→退出→重新登录，数据保持', async () => {
    const { user } = setup()
    // 登录
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.click(screen.getByRole('button', { name: '登录' }))
    await screen.findByRole('heading', { name: 'Todos' })

    // 添加 todo
    await user.type(screen.getByLabelText('新 todo 内容'), '持久化测试')
    await user.click(screen.getByRole('button', { name: '添加' }))
    await screen.findByText('持久化测试')

    // 退出
    await user.click(screen.getByRole('button', { name: '退出登录' }))
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()

    // 重新登录
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.click(screen.getByRole('button', { name: '登录' }))
    // todo 数据应保持
    expect(await screen.findByText('持久化测试')).toBeInTheDocument()
  })

  it('注册→去登录→登录→Todos 完整流转', async () => {
    const { user } = setup()
    // 去注册页
    await user.click(screen.getByRole('button', { name: '去注册' }))
    expect(screen.getByRole('heading', { name: '注册' })).toBeInTheDocument()

    // 切换到登录页
    await user.click(screen.getByRole('button', { name: '去登录' }))
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()

    // 登录进入 Todos
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.click(screen.getByRole('button', { name: '登录' }))
    expect(
      await screen.findByRole('heading', { name: 'Todos' }),
    ).toBeInTheDocument()
  })

  it('退出登录回到登录页', async () => {
    const { user } = setup()
    // 先登录
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.click(screen.getByRole('button', { name: '登录' }))
    await screen.findByRole('heading', { name: 'Todos' })
    // 退出
    await user.click(screen.getByRole('button', { name: '退出登录' }))
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument()
  })
})
