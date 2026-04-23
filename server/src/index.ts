import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import prisma from './prisma.js'
import authRouter from './routes/auth.js'
import todosRouter from './routes/todos.js'

const app = express()
const PORT = process.env['PORT'] ?? 3000

// 中间件
app.use(cors({
  origin: 'http://localhost:5173',  // Vite 开发服务器地址
  credentials: true,                // 允许浏览器发送/接收 cookie
}))
app.use(express.json())   // 解析请求体中的 JSON
app.use(cookieParser())   // 解析请求中的 cookie

// 路由
app.use('/auth', authRouter)
app.use('/todos', todosRouter)

// 健康检查接口，验证服务和数据库都正常
app.get('/health', async (_req, res) => {
  await prisma.$connect()
  res.json({ status: 'ok' })
})

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
