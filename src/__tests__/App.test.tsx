import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import * as authApi from "../api/auth";
import * as todosApi from "../api/todos";

vi.mock("../api/auth");
vi.mock("../api/todos");

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
  return { user };
}

// 辅助：通过 label 文本找到 antd Form.Item 对应的输入框
function getInput(label: string) {
  const labelEl = screen.getByText(label, { selector: "label" });
  const formItemControl = labelEl.closest(".ant-form-item")!;
  const input = formItemControl.querySelector("input")!;
  return input;
}

// 辅助：获取登录按钮（antd 会在中文字符间插入空格）
function getLoginButton() {
  return screen.getByRole("button", { name: /登\s*录/ });
}

// 辅助：获取退出登录按钮
function getLogoutButton() {
  return screen.getByRole("button", { name: /退出登录/ });
}

beforeEach(() => {
  // 默认：未登录状态
  vi.mocked(authApi.checkAuth).mockRejectedValue(new Error("未登录"));
  vi.mocked(authApi.login).mockResolvedValue({ message: "登录成功" });
  vi.mocked(authApi.register).mockResolvedValue({ message: "注册成功" });
  vi.mocked(authApi.logout).mockResolvedValue({ message: "已退出登录" });
  vi.mocked(todosApi.listTodos).mockResolvedValue([]);
});

describe("App", () => {
  it("未登录时显示登录页", async () => {
    setup();
    expect(
      await screen.findByRole("heading", { name: "登录" }),
    ).toBeInTheDocument();
  });

  it("已登录时直接进入 Todos 页", async () => {
    vi.mocked(authApi.checkAuth).mockResolvedValue({
      id: 1,
      email: "test@test.com",
    });
    setup();
    expect(
      await screen.findByRole("heading", { name: "Todos" }),
    ).toBeInTheDocument();
  });

  it("从登录页切换到注册页", async () => {
    const { user } = setup();
    await screen.findByRole("heading", { name: "登录" });
    await user.click(screen.getByText("去注册"));
    expect(screen.getByRole("heading", { name: "注册" })).toBeInTheDocument();
  });

  it("从注册页切换回登录页", async () => {
    const { user } = setup();
    await screen.findByRole("heading", { name: "登录" });
    await user.click(screen.getByText("去注册"));
    await user.click(screen.getByText("去登录"));
    expect(screen.getByRole("heading", { name: "登录" })).toBeInTheDocument();
  });

  it("登录成功后进入 Todos 页", async () => {
    const { user } = setup();
    await screen.findByRole("heading", { name: "登录" });
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.click(getLoginButton());
    expect(
      await screen.findByRole("heading", { name: "Todos" }),
    ).toBeInTheDocument();
  });

  it("注册成功后进入 Todos 页", async () => {
    const { user } = setup();
    await screen.findByRole("heading", { name: "登录" });
    await user.click(screen.getByText("去注册"));
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.type(getInput("确认密码"), "123456");
    await user.click(screen.getByRole("button", { name: /创建账号/ }));
    expect(
      await screen.findByRole("heading", { name: "Todos" }),
    ).toBeInTheDocument();
  });

  it("session-expired 事件触发时跳回登录页", async () => {
    vi.mocked(authApi.checkAuth).mockResolvedValue({
      id: 1,
      email: "test@test.com",
    });
    setup();
    await screen.findByRole("heading", { name: "Todos" });

    window.dispatchEvent(new CustomEvent("session-expired"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "登录" }),
      ).toBeInTheDocument();
    });
  });

  it("退出登录回到登录页", async () => {
    const { user } = setup();
    await screen.findByRole("heading", { name: "登录" });
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.click(getLoginButton());
    await screen.findByRole("heading", { name: "Todos" });
    await user.click(getLogoutButton());
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "登录" }),
      ).toBeInTheDocument();
    });
  });
});
