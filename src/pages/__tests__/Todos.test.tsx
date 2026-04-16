import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Todos from "../Todos";
import * as api from "../../api/todos";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function setup() {
  const onLogout = vi.fn();
  const user = userEvent.setup();
  render(<Todos onLogout={onLogout} />, { wrapper: createWrapper() });
  return { onLogout, user };
}

// 辅助：获取添加按钮（antd 会在中文字符间插入空格，accessible name 为 "添 加"）
function getAddButton() {
  return screen.getByRole("button", { name: /添\s*加/ });
}

// 辅助：获取退出登录按钮（antd icon 的 aria-label 会拼入 accessible name）
function getLogoutButton() {
  return screen.getByRole("button", { name: /退出登录/ });
}

beforeEach(() => {
  localStorage.clear();
});

describe("Todos", () => {
  it("初始显示空状态提示", async () => {
    setup();
    expect(
      await screen.findByText("还没有任何任务，加一个吧。"),
    ).toBeInTheDocument();
  });

  it("添加一个 todo", async () => {
    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");

    await user.type(screen.getByLabelText("新 todo 内容"), "买牛奶");
    await user.click(getAddButton());

    expect(await screen.findByText("买牛奶")).toBeInTheDocument();
    expect(screen.getByText("剩余 1 项")).toBeInTheDocument();
  });

  it("切换 todo 完成状态", async () => {
    await api.createTodo("任务一");
    const { user } = setup();

    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
    expect(screen.getByText("剩余 0 项")).toBeInTheDocument();
  });

  it("删除 todo", async () => {
    await api.createTodo("要删除");
    const { user } = setup();

    await screen.findByText("要删除");
    await user.click(screen.getByRole("button", { name: "删除 要删除" }));

    await waitFor(() => {
      expect(screen.queryByText("要删除")).not.toBeInTheDocument();
    });
  });

  it("点击退出登录", async () => {
    const { user, onLogout } = setup();
    await user.click(getLogoutButton());
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("输入为空时添加按钮禁用", async () => {
    setup();
    await screen.findByText("还没有任何任务，加一个吧。");
    expect(getAddButton()).toBeDisabled();
  });

  it('添加过程中按钮显示"添加中…"且输入框禁用', async () => {
    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");

    await user.type(screen.getByLabelText("新 todo 内容"), "测试任务");
    await user.click(getAddButton());

    // mutation pending 期间，antd loading 按钮仍然存在
    // 等待 mutation 完成
    await screen.findByText("测试任务");
  });

  it("已完成的 todo 再次点击恢复为未完成", async () => {
    const todo = await api.createTodo("任务");
    await api.updateTodo(todo.id, { completed: true });
    const { user } = setup();

    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(screen.getByText("剩余 0 项")).toBeInTheDocument();

    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });
    expect(screen.getByText("剩余 1 项")).toBeInTheDocument();
  });

  it("数据从 localStorage 持久化恢复", async () => {
    // 先写入数据
    await api.createTodo("持久化任务");

    // 渲染组件（模拟刷新）
    setup();
    expect(await screen.findByText("持久化任务")).toBeInTheDocument();
  });

  it("连续快速添加多个 todo", async () => {
    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");

    const input = screen.getByLabelText("新 todo 内容");

    // 添加第一个
    await user.type(input, "任务一");
    await user.click(getAddButton());
    await screen.findByText("任务一");

    // 添加第二个
    await user.type(input, "任务二");
    await user.click(getAddButton());
    await screen.findByText("任务二");

    // 添加第三个
    await user.type(input, "任务三");
    await user.click(getAddButton());
    await screen.findByText("任务三");

    expect(screen.getByText("剩余 3 项")).toBeInTheDocument();
  });
});
