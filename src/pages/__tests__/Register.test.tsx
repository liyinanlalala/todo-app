import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../Register'

function setup() {
  const onSuccess = vi.fn()
  const onSwitchToLogin = vi.fn()
  const user = userEvent.setup()
  render(<Register onSuccess={onSuccess} onSwitchToLogin={onSwitchToLogin} />)
  return { onSuccess, onSwitchToLogin, user }
}

describe('Register', () => {
  it('渲染注册表单', () => {
    setup()
    expect(screen.getByRole('heading', { name: '注册' })).toBeInTheDocument()
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument()
  })

  it('无效邮箱显示错误', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('邮箱'), 'test@localhost')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.type(screen.getByLabelText('确认密码'), '123456')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument()
  })

  it('密码少于6位显示错误', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '12345')
    await user.type(screen.getByLabelText('确认密码'), '12345')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(screen.getByText('密码至少 6 位')).toBeInTheDocument()
  })

  it('两次密码不一致显示错误', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.type(screen.getByLabelText('确认密码'), '654321')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()
  })

  it('有效输入调用 onSuccess', async () => {
    const { user, onSuccess } = setup()
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.type(screen.getByLabelText('确认密码'), '123456')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('先触发错误再正确提交，错误消息消失', async () => {
    const { user, onSuccess } = setup()
    // 先触发密码不一致错误
    await user.type(screen.getByLabelText('邮箱'), 'test@test.com')
    await user.type(screen.getByLabelText('密码'), '123456')
    await user.type(screen.getByLabelText('确认密码'), '000000')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument()

    // 修正确认密码后重新提交
    await user.clear(screen.getByLabelText('确认密码'))
    await user.type(screen.getByLabelText('确认密码'), '123456')
    await user.click(screen.getByRole('button', { name: '创建账号' }))
    expect(screen.queryByText('两次输入的密码不一致')).not.toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('点击"去登录"调用 onSwitchToLogin', async () => {
    const { user, onSwitchToLogin } = setup()
    await user.click(screen.getByRole('button', { name: '去登录' }))
    expect(onSwitchToLogin).toHaveBeenCalledOnce()
  })
})
