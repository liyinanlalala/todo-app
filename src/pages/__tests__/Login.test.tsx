import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import * as authApi from "../../api/auth";

vi.mock("../../api/auth");

function setup() {
  const onSuccess = vi.fn();
  const onSwitchToRegister = vi.fn();
  const user = userEvent.setup();
  render(
    <Login onSuccess={onSuccess} onSwitchToRegister={onSwitchToRegister} />,
  );
  return { onSuccess, onSwitchToRegister, user };
}

// 辅助：通过 label 文本找到对应的输入框
function getInput(label: string) {
  const labelEl = screen.getByText(label, { selector: "label" });
  const formItemControl = labelEl.closest(".ant-form-item")!;
  const input = formItemControl.querySelector("input")!;
  return input;
}

// 辅助：获取提交按钮（antd 会在中文字符间插入空格）
function getSubmitButton() {
  return screen.getByRole("button", { name: /登\s*录/ });
}

beforeEach(() => {
  vi.mocked(authApi.login).mockResolvedValue({ message: "登录成功" });
});

describe("Login", () => {
  it("渲染登录表单", () => {
    setup();
    expect(screen.getByRole("heading", { name: "登录" })).toBeInTheDocument();
    expect(getInput("邮箱")).toBeInTheDocument();
    expect(getInput("密码")).toBeInTheDocument();
  });

  it("密码少于6位显示错误", async () => {
    const { user } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "12345");
    await user.click(getSubmitButton());
    expect(await screen.findByText("密码至少 6 位")).toBeInTheDocument();
  });

  it("有效输入调用登录 API 并触发 onSuccess", async () => {
    const { user, onSuccess } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(authApi.login).toHaveBeenCalledWith("test@test.com", "123456");
  });

  it("登录失败显示错误信息", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error("邮箱或密码错误"));
    const { user, onSuccess } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.click(getSubmitButton());
    expect(await screen.findByText("邮箱或密码错误")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('点击"去注册"调用 onSwitchToRegister', async () => {
    const { user, onSwitchToRegister } = setup();
    await user.click(screen.getByText("去注册"));
    expect(onSwitchToRegister).toHaveBeenCalledOnce();
  });
});
