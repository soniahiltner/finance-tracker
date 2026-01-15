import express from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validation/schemas.js'

const router = express.Router()

// Rutas públicas
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

// Rutas protegidas
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)

export default router
