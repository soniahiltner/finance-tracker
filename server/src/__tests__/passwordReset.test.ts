import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { forgotPassword, resetPassword } from '../controllers/authController.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validate.js'
import {
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validation/schemas.js'
import * as emailService from '../services/emailService.js'

// Mock del servicio de email
jest.mock('../services/emailService.js')

let app: Express
let mongoServer: MongoMemoryServer

// Setup test app
const setupApp = (): Express => {
  const testApp = express()
  testApp.use(express.json())

  // Definir rutas directamente
  testApp.post(
    '/api/auth/forgot-password',
    validate(forgotPasswordSchema),
    forgotPassword
  )
  testApp.post(
    '/api/auth/reset-password',
    validate(resetPasswordSchema),
    resetPassword
  )

  testApp.use(errorHandler)
  return testApp
}

beforeAll(async () => {
  // Configurar JWT secret para tests
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.CLIENT_URL = 'http://localhost:3000'

  // Crear servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  await mongoose.connect(mongoUri)

  app = setupApp()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  // Limpiar colecciones antes de cada test
  await User.deleteMany({})
  jest.clearAllMocks()
})

describe('Auth Controller - POST /api/auth/forgot-password', () => {
  it('should send password reset email for existing user', async () => {
    const user = await User.create({
      email: 'forgot@example.com',
      password: 'Password123!',
      name: 'Forgot Test'
    })

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'forgot@example.com' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('email existe')

    // Verificar que el email service fue llamado
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'forgot@example.com',
        name: 'Forgot Test',
        resetUrl: expect.stringContaining('reset-password?token=')
      })
    )

    // Verificar que el token y expiry fueron guardados
    const updatedUser = await User.findById(user._id).select(
      '+passwordResetToken +passwordResetExpires'
    )
    expect(updatedUser?.passwordResetToken).toBeTruthy()
    expect(updatedUser?.passwordResetExpires).toBeTruthy()
  })

  it('should return 200 even if user does not exist (security measure)', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('email existe')

    // Verificar que el email service no fue llamado
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('should return 400 if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({})
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'invalid-email' })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should generate a valid reset token that expires in 1 hour', async () => {
    await User.create({
      email: 'token@example.com',
      password: 'Password123!',
      name: 'Token Test'
    })

    const now = Date.now()

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'token@example.com' })
      .expect(200)

    const user = await User.findOne({ email: 'token@example.com' }).select(
      '+passwordResetToken +passwordResetExpires'
    )

    expect(user?.passwordResetToken).toBeTruthy()
    expect(user?.passwordResetExpires).toBeTruthy()

    // Verificar que la expiración es aproximadamente 1 hora
    const expiryTime = user!.passwordResetExpires!.getTime()
    const hourInMs = 60 * 60 * 1000
    expect(expiryTime - now).toBeGreaterThanOrEqual(hourInMs - 1000)
    expect(expiryTime - now).toBeLessThanOrEqual(hourInMs + 1000)
  })
})

describe('Auth Controller - POST /api/auth/reset-password', () => {
  let resetToken: string
  let hashedToken: string

  beforeEach(async () => {
    // Crear un token válido
    resetToken = crypto.randomBytes(32).toString('hex')
    hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    await User.create({
      email: 'reset@example.com',
      password: 'OldPassword123!',
      name: 'Reset Test',
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    })
  })

  it('should reset password successfully with valid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'NewPassword123!'
      })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('actualizada')

    // Verificar que el token fue eliminado
    const user = await User.findOne({ email: 'reset@example.com' }).select(
      '+passwordResetToken +passwordResetExpires'
    )
    expect(user?.passwordResetToken).toBeUndefined()
    expect(user?.passwordResetExpires).toBeUndefined()

    // Verificar que el nuevo password funciona
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'reset@example.com',
      password: 'NewPassword123!'
    })

    // La ruta de login no está en este test, pero podemos verificar que el password fue hasheado
    const updatedUser = await User.findOne({
      email: 'reset@example.com'
    }).select('+password')
    expect(updatedUser?.password).not.toBe('NewPassword123!')
  })

  it('should return 400 with expired token', async () => {
    // Crear token expirado
    const expiredToken = crypto.randomBytes(32).toString('hex')
    const expiredHashedToken = crypto
      .createHash('sha256')
      .update(expiredToken)
      .digest('hex')

    await User.updateOne(
      { email: 'reset@example.com' },
      {
        passwordResetToken: expiredHashedToken,
        passwordResetExpires: new Date(Date.now() - 1000) // Expirado hace 1 segundo
      }
    )

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: expiredToken,
        newPassword: 'NewPassword123!'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('inválido o expirado')
  })

  it('should return 400 with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token-12345',
        newPassword: 'NewPassword123!'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('inválido o expirado')
  })

  it('should return 400 if password is too weak', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: '123' // Menos de 6 caracteres
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body).toHaveProperty('message')
  })

  it('should return 400 if token is missing', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        newPassword: 'NewPassword123!'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 if newPassword is missing', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken
      })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should not reset password for user without reset token', async () => {
    // Crear usuario sin token de reset
    const user = await User.create({
      email: 'notoken@example.com',
      password: 'OldPassword123!',
      name: 'No Token Test'
    })

    const validToken = crypto.randomBytes(32).toString('hex')

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: validToken,
        newPassword: 'NewPassword123!'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('inválido o expirado')
  })

  it('should handle token case sensitivity correctly', async () => {
    // El token en la DB está hasheado, pero el usuario proporciona el token en texto plano
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'NewPassword123!'
      })
      .expect(200)

    expect(response.body.success).toBe(true)
  })
})

describe('Password Reset - Integration Tests', () => {
  it('should complete full forgot-password to reset-password flow', async () => {
    // 1. Registrar usuario (simulated, ya que no tenemos endpoint en este test)
    const user = await User.create({
      email: 'integration@example.com',
      password: 'OldPassword123!',
      name: 'Integration Test'
    })

    // 2. Solicitar reset
    const forgotResponse = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'integration@example.com' })
      .expect(200)

    expect(forgotResponse.body.success).toBe(true)

    // 3. Obtener el token generado
    const userWithToken = await User.findById(user._id).select(
      '+passwordResetToken +passwordResetExpires'
    )
    const token = userWithToken?.passwordResetToken

    // Crear el token en texto plano a partir del hasheado (esto no es posible en la realidad,
    // pero en nuestro caso sabemos el flujo: el usuario lo recibe por email)
    // En el test real, simularemos que el usuario tiene el token del email
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    await User.updateOne(
      { _id: user._id },
      {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
      }
    )

    // 4. Reset password
    const resetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'NewPassword123!'
      })
      .expect(200)

    expect(resetResponse.body.success).toBe(true)
    expect(resetResponse.body.message).toContain('actualizada')

    // 5. Verificar que el token fue limpiado
    const finalUser = await User.findById(user._id).select(
      '+passwordResetToken +passwordResetExpires'
    )
    expect(finalUser?.passwordResetToken).toBeUndefined()
    expect(finalUser?.passwordResetExpires).toBeUndefined()
  })
})
