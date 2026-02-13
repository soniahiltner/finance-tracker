import express from 'express'
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validation/schemas.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Rutas públicas
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), authLimiter, login)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

// Rutas protegidas
router.get('/me', protect, getMe)
router.put('/profile', protect, validate(updateProfileSchema), updateProfile)
router.put('/password', protect, validate(changePasswordSchema), changePassword)

export default router
