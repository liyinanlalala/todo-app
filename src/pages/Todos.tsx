import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Checkbox,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Space,
  Spin,
  Typography,
} from "antd";
import { DeleteOutlined, LogoutOutlined } from "@ant-design/icons";
import {
  useAddTodo,
  useDeleteTodo,
  useToggleTodo,
  useTodosQuery,
} from "../hooks/useTodosQuery";
import { logout } from "../api/auth";

const { Title, Text } = Typography;

type Props = {
  onLogout: () => void;
};

function Todos({ onLogout }: Props) {
  const { message } = App.useApp();
  const { data: todos, isPending, isError, error } = useTodosQuery();
  const addMutation = useAddTodo();
  const toggleMutation = useToggleTodo();
  const deleteMutation = useDeleteTodo();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed, {
      onSuccess: () => setInput(""),
      onError: (err) => message.error(err.message),
    });
  };

  return (
    <div className="max-w-[560px] mx-auto mt-12 px-4">
      <Flex align="baseline" justify="space-between" className="mb-6">
        <Title level={2} className="m-0!">
          Todos
        </Title>
        <Button
          type="link"
          icon={<LogoutOutlined />}
          onClick={() => logout().then(onLogout)}
        >
          退出登录
        </Button>
      </Flex>

      <Form layout="inline" onFinish={handleAdd} className="flex gap-2 mb-6">
        <Form.Item className="flex-1 me-0!">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="要做点什么?"
            aria-label="新 todo 内容"
            disabled={addMutation.isPending}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!input.trim() || addMutation.isPending}
            loading={addMutation.isPending}
          >
            {addMutation.isPending ? "添加中…" : "添加"}
          </Button>
        </Form.Item>
      </Form>

      {isPending && (
        <Flex justify="center" className="py-8">
          <Spin description="加载中…" />
        </Flex>
      )}

      {isError && (
        <Alert
          type="error"
          showIcon
          title="加载失败"
          description={error.message}
        />
      )}

      {!isPending && !isError && todos.length === 0 && (
        <Empty description="还没有任何任务，加一个吧。" className="py-8" />
      )}

      {!isPending && !isError && todos.length > 0 && (
        <>
          <List
            dataSource={todos}
            renderItem={(todo) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      deleteMutation.mutate(todo.id, {
                        onError: (err) => message.error(err.message),
                      })
                    }
                    aria-label={`删除 ${todo.title}`}
                  />,
                ]}
              >
                <Space>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() =>
                      toggleMutation.mutate(
                        { id: todo.id, completed: !todo.completed },
                        { onError: (err) => message.error(err.message) },
                      )
                    }
                  />
                  <Text
                    delete={todo.completed}
                    type={todo.completed ? "secondary" : undefined}
                  >
                    {todo.title}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
          <Text type="secondary" className="block mt-4">
            剩余 {todos.filter((t) => !t.completed).length} 项
          </Text>
        </>
      )}
    </div>
  );
}

export default Todos;
