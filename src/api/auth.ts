const API_BASE = 'http://localhost:3000'

type AuthResponse = { message: string }
type AuthError = { error: string }

async function request(url: string, body: object): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  const data = await res.json() as AuthResponse | AuthError

  if (!res.ok) {
    throw new Error((data as AuthError).error ?? '请求失败')
  }

  return data as AuthResponse
}

export function login(email: string, password: string) {
  return request('/auth/login', { email, password })
}

export function register(email: string, password: string) {
  return request('/auth/register', { email, password })
}

export function logout() {
  return request('/auth/logout', {})
}
