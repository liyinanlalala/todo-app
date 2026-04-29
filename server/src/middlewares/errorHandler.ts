import { type Request, type Response, type NextFunction } from 'express'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err)
  res.status(500).json({ error: '服务器内部错误' })
}
