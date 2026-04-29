import { type Router as RouterType, Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { getTodos, createTodo, updateTodo, deleteTodo } from '../controllers/todos.js'

const router: RouterType = Router()

router.use(requireAuth)

router.get('/', getTodos)
router.post('/', createTodo)
router.patch('/:id', updateTodo)
router.delete('/:id', deleteTodo)

export default router
