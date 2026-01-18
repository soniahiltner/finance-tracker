import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User } from '../models/index.js'
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validation/schemas.js'

let app: Express
let mongoServer: MongoMemoryServer

// Setup test app
const setupApp = (): Express => {
  const testApp = express()
  testApp.use(express.json())

  // Definir rutas directamente
  testApp.post('/api/auth/register', validate(registerSchema), register)
  testApp.post('/api/auth/login', validate(loginSchema), login)
  testApp.get('/api/auth/me', protect, getMe)
  testApp.put(
    '/api/auth/profile',
    protect,
    validate(updateProfileSchema),
    updateProfile
  )
  testApp.put(
    '/api/auth/password',
    protect,
    validate(changePasswordSchema),
    changePassword
  )

  testApp.use(errorHandler)
  return testApp
}

beforeAll(async () => {
  // Configurar JWT secret para tests
  process.env.JWT_SECRET = 'test-secret-key-for-testing'

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
})

describe('Auth Controller - POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty('id')
    expect(response.body.user.email).toBe(newUser.email)
    expect(response.body.user.name).toBe(newUser.name)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user).not.toHaveProperty('password')
  })

  it('should return 400 if user already exists', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'Password123!',
      name: 'Existing User'
    }

    // Crear usuario primero
    await User.create(userData)

    // Intentar registrar con el mismo email
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('already exists')
  })

  it('should return 400 for invalid email format', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'Password123!',
      name: 'Test User'
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(invalidUser)
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 for weak password', async () => {
    const weakPasswordUser = {
      email: 'test@example.com',
      password: '123',
      name: 'Test User'
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(weakPasswordUser)
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 for missing required fields', async () => {
    const incompleteUser = {
      email: 'test@example.com'
      // password y name faltantes
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(incompleteUser)
      .expect(400)

    expect(response.body.success).toBe(false)
  })
})

describe('Auth Controller - POST /api/auth/login', () => {
  beforeEach(async () => {
    // Crear usuario de prueba
    await User.create({
      email: 'login@example.com',
      password: 'Password123!',
      name: 'Login Test'
    })
  })

  it('should login successfully with valid credentials', async () => {
    const credentials = {
      email: 'login@example.com',
      password: 'Password123!'
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty('id')
    expect(response.body.user.email).toBe(credentials.email)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user).not.toHaveProperty('password')
  })

  it('should return 400 if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password123!' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 401 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!'
      })
      .expect(401)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Invalid credentials')
  })

  it('should return 401 for incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'WrongPassword123!'
      })
      .expect(401)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Invalid credentials')
  })
})

describe('Auth Controller - GET /api/auth/me', () => {
  let authToken: string
  let userId: string

  beforeEach(async () => {
    // Crear y autenticar usuario
    const user = await User.create({
      email: 'me@example.com',
      password: 'Password123!',
      name: 'Me Test'
    })

    userId = user._id.toString()

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'me@example.com',
      password: 'Password123!'
    })

    authToken = loginResponse.body.token
  })

  it('should return current user data with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty('id', userId)
    expect(response.body.user.email).toBe('me@example.com')
    expect(response.body.user.name).toBe('Me Test')
    expect(response.body.user).toHaveProperty('createdAt')
    expect(response.body.user).not.toHaveProperty('password')
  })

  it('should return 401 without authorization header', async () => {
    const response = await request(app).get('/api/auth/me').expect(401)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('authorized')
  })

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)

    expect(response.body.success).toBe(false)
  })

  it('should return 401 with malformed authorization header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', authToken) // Sin "Bearer "
      .expect(401)

    expect(response.body.success).toBe(false)
  })

  it('should return 401 if user was deleted (token still valid but user gone)', async () => {
    // Eliminar el usuario
    await User.findByIdAndDelete(userId)

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(401)

    expect(response.body.success).toBe(false)
  })
})

describe('Auth Controller - PUT /api/auth/profile', () => {
  let authToken: string
  let userId: string

  beforeEach(async () => {
    // Crear y autenticar usuario
    const user = await User.create({
      email: 'me@example.com',
      password: 'Password123!',
      name: 'Me Test'
    })

    userId = user._id.toString()

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'me@example.com',
      password: 'Password123!'
    })

    authToken = loginResponse.body.token
  })
  it('should update user profile successfully', async () => {
    const updatedData = {
      name: 'Updated Name',
      email: 'updated@example.com'
    }

    const response = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.user).toHaveProperty('id', userId)
    expect(response.body.user.name).toBe(updatedData.name)
    expect(response.body.user.email).toBe(updatedData.email)
  })

  it('should return 400 if new email is already in use', async () => {
    // Crear otro usuario con el email que se intentará usar
    await User.create({
      email: 'existing@example.com',
      password: 'Password123!',
      name: 'Existing User'
    })

    const response = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'existing@example.com' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('already in use')
  })
})
