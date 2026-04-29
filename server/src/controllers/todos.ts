import { type Request, type Response } from 'express'
import prisma from '../prisma.js'

export async function getTodos(req: Request, res: Response) {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(todos)
}

export async function createTodo(req: Request, res: Response) {
  const { title } = req.body
  const todo = await prisma.todo.create({
    data: { title, userId: req.userId! },
  })
  res.status(201).json(todo)
}

export async function updateTodo(req: Request, res: Response) {
  const id = Number(req.params['id'])
  const { completed } = req.body
  const todo = await prisma.todo.update({
    where: { id, userId: req.userId },
    data: { completed },
  })
  res.json(todo)
}

export async function deleteTodo(req: Request, res: Response) {
  const id = Number(req.params['id'])
  await prisma.todo.delete({
    where: { id, userId: req.userId },
  })
  res.status(204).end()
}
