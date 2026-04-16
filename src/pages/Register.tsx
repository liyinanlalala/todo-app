import { Button, Card, Form, Input, Typography } from "antd";

const { Title, Text, Link } = Typography;

type Props = {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

function Register({ onSuccess, onSwitchToLogin }: Props) {
  const [form] = Form.useForm();

  const handleFinish = (values: {
    email: string;
    password: string;
    confirm: string;
  }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      form.setFields([{ name: "email", errors: ["请输入有效的邮箱地址"] }]);
      return;
    }
    if (values.password.length < 6) {
      form.setFields([{ name: "password", errors: ["密码至少 6 位"] }]);
      return;
    }
    if (values.password !== values.confirm) {
      form.setFields([{ name: "confirm", errors: ["两次输入的密码不一致"] }]);
      return;
    }
    onSuccess();
  };

  return (
    <div className="max-w-[400px] mx-auto mt-20 px-4">
      <Card>
        <Title level={2} className="text-center mb-6">
          注册
        </Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ required: true, message: "请输入邮箱" }]}
          >
            <Input type="email" autoComplete="email" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm"
            rules={[{ required: true, message: "请确认密码" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              创建账号
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="block text-center">
          已有账号? <Link onClick={onSwitchToLogin}>去登录</Link>
        </Text>
      </Card>
    </div>
  );
}

export default Register;
