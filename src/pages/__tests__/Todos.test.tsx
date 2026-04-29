import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp } from "antd";
import Todos from "../Todos";
import * as todosApi from "../../api/todos";
import * as authApi from "../../api/auth";
import type { Todo } from "../../types";

vi.mock("../../api/todos");
vi.mock("../../api/auth");

const mockTodo: Todo = {
  id: 1,
  title: "测试任务",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AntdApp>{children}</AntdApp>
      </QueryClientProvider>
    );
  };
}

function setup() {
  const onLogout = vi.fn();
  const user = userEvent.setup();
  render(<Todos onLogout={onLogout} />, { wrapper: createWrapper() });
  return { onLogout, user };
}

// 辅助：获取添加按钮
function getAddButton() {
  return screen.getByRole("button", { name: /添\s*加/ });
}

// 辅助：获取退出登录按钮
function getLogoutButton() {
  return screen.getByRole("button", { name: /退出登录/ });
}

beforeEach(() => {
  vi.mocked(todosApi.listTodos).mockResolvedValue([]);
  vi.mocked(todosApi.createTodo).mockImplementation(async (title) => ({
    id: Date.now(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  }));
  vi.mocked(todosApi.updateTodo).mockImplementation(async (id, patch) => ({
    ...mockTodo,
    id,
    ...patch,
  }));
  vi.mocked(todosApi.deleteTodo).mockResolvedValue(undefined);
  vi.mocked(authApi.logout).mockResolvedValue({ message: "已退出登录" });
});

describe("Todos", () => {
  it("初始显示空状态提示", async () => {
    setup();
    expect(
      await screen.findByText("还没有任何任务，加一个吧。"),
    ).toBeInTheDocument();
  });

  it("显示已有 todo 列表", async () => {
    vi.mocked(todosApi.listTodos).mockResolvedValue([mockTodo]);
    setup();
    expect(await screen.findByText("测试任务")).toBeInTheDocument();
    expect(screen.getByText("剩余 1 项")).toBeInTheDocument();
  });

  it("添加一个 todo", async () => {
    // 添加后 listTodos 返回新数据
    vi.mocked(todosApi.listTodos)
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ ...mockTodo, title: "买牛奶" }]);

    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");

    await user.type(screen.getByLabelText("新 todo 内容"), "买牛奶");
    await user.click(getAddButton());

    expect(await screen.findByText("买牛奶")).toBeInTheDocument();
    expect(todosApi.createTodo).toHaveBeenCalledWith("买牛奶");
  });

  it("切换 todo 完成状态", async () => {
    vi.mocked(todosApi.listTodos)
      .mockResolvedValueOnce([mockTodo])
      .mockResolvedValue([{ ...mockTodo, completed: true }]);

    const { user } = setup();
    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  it("删除 todo", async () => {
    vi.mocked(todosApi.listTodos)
      .mockResolvedValueOnce([mockTodo])
      .mockResolvedValue([]);

    const { user } = setup();
    await screen.findByText("测试任务");
    await user.click(screen.getByRole("button", { name: "删除 测试任务" }));

    await waitFor(() => {
      expect(screen.queryByText("测试任务")).not.toBeInTheDocument();
    });
    expect(todosApi.deleteTodo).toHaveBeenCalledWith(1);
  });

  it("点击退出登录调用 logout API", async () => {
    const { user, onLogout } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");
    await user.click(getLogoutButton());
    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledOnce();
    });
    expect(authApi.logout).toHaveBeenCalledOnce();
  });

  it("添加失败时显示错误提示", async () => {
    vi.mocked(todosApi.createTodo).mockRejectedValue(new Error("服务器内部错误"));
    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");
    await user.type(screen.getByLabelText("新 todo 内容"), "买牛奶");
    await user.click(getAddButton());
    expect(await screen.findByText("服务器内部错误")).toBeInTheDocument();
  });

  it("删除失败时显示错误提示", async () => {
    vi.mocked(todosApi.listTodos).mockResolvedValue([mockTodo]);
    vi.mocked(todosApi.deleteTodo).mockRejectedValue(new Error("服务器内部错误"));
    const { user } = setup();
    await screen.findByText("测试任务");
    await user.click(screen.getByRole("button", { name: "删除 测试任务" }));
    expect(await screen.findByText("服务器内部错误")).toBeInTheDocument();
  });

  it("切换状态失败时显示错误提示", async () => {
    vi.mocked(todosApi.listTodos).mockResolvedValue([mockTodo]);
    vi.mocked(todosApi.updateTodo).mockRejectedValue(new Error("服务器内部错误"));
    const { user } = setup();
    await screen.findByText("测试任务");
    await user.click(screen.getByRole("checkbox"));
    expect(await screen.findByText("服务器内部错误")).toBeInTheDocument();
  });

  it("退出登录失败时显示错误提示", async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error("退出失败，请重试"));
    const { user } = setup();
    await screen.findByText("还没有任何任务，加一个吧。");
    await user.click(getLogoutButton());
    expect(await screen.findByText("退出失败，请重试")).toBeInTheDocument();
  });

  it("输入为空时添加按钮禁用", async () => {
    setup();
    await screen.findByText("还没有任何任务，加一个吧。");
    expect(getAddButton()).toBeDisabled();
  });
});
