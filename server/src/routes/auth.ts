import { type Router as RouterType, Router } from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { register, login, me, logout } from '../controllers/auth.js'

const router: RouterType = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.post('/logout', logout)

export default router
