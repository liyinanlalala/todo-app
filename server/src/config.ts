import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`环境变量 ${key} 未配置`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback
}

export const config = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port: Number(optional('PORT', '3000')),
}
