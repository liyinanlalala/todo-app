import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "../Register";
import * as authApi from "../../api/auth";

vi.mock("../../api/auth");

function setup() {
  const onSuccess = vi.fn();
  const onSwitchToLogin = vi.fn();
  const user = userEvent.setup();
  render(<Register onSuccess={onSuccess} onSwitchToLogin={onSwitchToLogin} />);
  return { onSuccess, onSwitchToLogin, user };
}

// 辅助：通过 label 文本找到对应的输入框
function getInput(label: string) {
  const labelEl = screen.getByText(label, { selector: "label" });
  const formItemControl = labelEl.closest(".ant-form-item")!;
  const input = formItemControl.querySelector("input")!;
  return input;
}

// 辅助：获取提交按钮
function getSubmitButton() {
  return screen.getByRole("button", { name: /创建账号/ });
}

beforeEach(() => {
  vi.mocked(authApi.register).mockResolvedValue({ message: "注册成功" });
});

describe("Register", () => {
  it("渲染注册表单", () => {
    setup();
    expect(screen.getByRole("heading", { name: "注册" })).toBeInTheDocument();
    expect(getInput("邮箱")).toBeInTheDocument();
    expect(getInput("密码")).toBeInTheDocument();
    expect(getInput("确认密码")).toBeInTheDocument();
  });

  it("密码少于6位显示错误", async () => {
    const { user } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "12345");
    await user.type(getInput("确认密码"), "12345");
    await user.click(getSubmitButton());
    expect(await screen.findByText("密码至少 6 位")).toBeInTheDocument();
  });

  it("两次密码不一致显示错误", async () => {
    const { user } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.type(getInput("确认密码"), "654321");
    await user.click(getSubmitButton());
    expect(await screen.findByText("两次输入的密码不一致")).toBeInTheDocument();
  });

  it("有效输入调用注册 API 并触发 onSuccess", async () => {
    const { user, onSuccess } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.type(getInput("确认密码"), "123456");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(authApi.register).toHaveBeenCalledWith("test@test.com", "123456");
  });

  it("注册失败显示错误信息", async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error("该邮箱已注册"));
    const { user, onSuccess } = setup();
    await user.type(getInput("邮箱"), "test@test.com");
    await user.type(getInput("密码"), "123456");
    await user.type(getInput("确认密码"), "123456");
    await user.click(getSubmitButton());
    expect(await screen.findByText("该邮箱已注册")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('点击"去登录"调用 onSwitchToLogin', async () => {
    const { user, onSwitchToLogin } = setup();
    await user.click(screen.getByText("去登录"));
    expect(onSwitchToLogin).toHaveBeenCalledOnce();
  });
});
