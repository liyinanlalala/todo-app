import { type Request, type Response } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import prisma from '../prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

async function prismaOrNotFound<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError()
    }
    throw err
  }
}

export async function getTodos(req: Request, res: Response) {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(todos)
}

export async function createTodo(req: Request, res: Response) {
  const { title } = req.body
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new BadRequestError('title 不能为空')
  }
  const todo = await prisma.todo.create({
    data: { title: title.trim(), userId: req.userId! },
  })
  res.status(201).json(todo)
}

export async function updateTodo(req: Request, res: Response) {
  const id = Number(req.params['id'])
  const { completed } = req.body
  if (typeof completed !== 'boolean') {
    throw new BadRequestError('completed 必须为布尔值')
  }
  const todo = await prismaOrNotFound(() =>
    prisma.todo.update({
      where: { id, userId: req.userId },
      data: { completed },
    })
  )
  res.json(todo)
}

export async function deleteTodo(req: Request, res: Response) {
  const id = Number(req.params['id'])
  await prismaOrNotFound(() =>
    prisma.todo.delete({
      where: { id, userId: req.userId },
    })
  )
  res.status(204).end()
}
