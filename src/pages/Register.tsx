import { useState } from "react";
import { Button, Card, Form, Input, Typography, Alert } from "antd";
import { register } from "../api/auth";

const { Title, Text, Link } = Typography;

type Props = {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

function Register({ onSuccess, onSwitchToLogin }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: {
    email: string;
    password: string;
    confirm: string;
  }) => {
    if (values.password !== values.confirm) {
      form.setFields([{ name: "confirm", errors: ["两次输入的密码不一致"] }]);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(values.email, values.password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[400px] mx-auto mt-20 px-4">
      <Card>
        <Title level={2} className="text-center mb-6">
          注册
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
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
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
