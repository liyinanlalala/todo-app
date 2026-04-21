import { type Router as RouterType, Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../middlewares/auth.js'

const router: RouterType = Router()

// 所有 todo 接口都需要认证
router.use(requireAuth)

// GET /todos — 查询当前用户的 todo 列表
router.get('/', async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(todos)
})

// POST /todos — 创建 todo
router.post('/', async (req, res) => {
  const { title } = req.body
  const todo = await prisma.todo.create({
    data: { title, userId: req.userId! },
  })
  res.status(201).json(todo)
})

// PATCH /todos/:id — 更新 todo（切换完成状态）
router.patch('/:id', async (req, res) => {
  const id = Number(req.params['id'])
  const { completed } = req.body
  const todo = await prisma.todo.update({
    where: { id, userId: req.userId },
    data: { completed },
  })
  res.json(todo)
})

// DELETE /todos/:id — 删除 todo
router.delete('/:id', async (req, res) => {
  const id = Number(req.params['id'])
  await prisma.todo.delete({
    where: { id, userId: req.userId },
  })
  res.status(204).end()
})

export default router
