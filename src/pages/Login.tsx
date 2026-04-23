import { useState } from "react";
import { Button, Card, Form, Input, Typography, Alert } from "antd";
import { login } from "../api/auth";

const { Title, Text, Link } = Typography;

type Props = {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
};

function Login({ onSuccess, onSwitchToRegister }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await login(values.email, values.password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[400px] mx-auto mt-20 px-4">
      <Card>
        <Title level={2} className="text-center mb-6">
          登录
        </Title>
        {error && (
          <Alert type="error" showIcon message={error} className="mb-4" />
        )}
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input type="email" autoComplete="email" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" className="block text-center">
          还没有账号? <Link onClick={onSwitchToRegister}>去注册</Link>
        </Text>
      </Card>
    </div>
  );
}

export default Login;
