import express, { type Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import todosRouter from './routes/todos.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app: Express = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/todos', todosRouter)

app.use(errorHandler)

export default app
