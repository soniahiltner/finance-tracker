import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User } from '../models/index.js'
import { queryAI, getSuggestions } from '../controllers/aiController.js'
import { protect } from '../middleware/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { generateToken } from '../utils/generateToken.js'
import { ClaudeService } from '../services/claudeService.js'

// Mock del ClaudeService
jest.mock('../services/claudeService.js')

let app: Express
let mongoServer: MongoMemoryServer
let authToken: string
let userId: string

// Setup test app
const setupApp = (): Express => {
  const testApp = express()
  testApp.use(express.json())

  // Definir rutas directamente (sin validación ya que el controller hace su propia validación)
  testApp.post('/api/ai/query', protect, queryAI)
  testApp.get('/api/ai/suggestions', protect, getSuggestions)

  testApp.use(errorHandler)
  return testApp
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.ANTHROPIC_API_KEY = 'test-api-key'

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
  await User.deleteMany({})

  // Crear usuario y token
  const user = await User.create({
    email: 'ai@test.com',
    password: 'Password123!',
    name: 'AI Test'
  })

  userId = user._id.toString()
  authToken = generateToken(userId)

  // Limpiar mocks
  jest.clearAllMocks()
})

describe('AI Controller - POST /api/ai/query', () => {
  it('should query AI successfully', async () => {
    const mockAnswer = 'Esta es una respuesta de prueba del asistente de IA.'

    // Mock del método query
    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockAnswer)

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: '¿Cuánto gasto al mes?' })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.query).toBe('¿Cuánto gasto al mes?')
    expect(response.body.answer).toBe(mockAnswer)
    expect(response.body).toHaveProperty('timestamp')

    // Verificar que se llamó al servicio
    expect(ClaudeService.prototype.query).toHaveBeenCalledWith(
      userId,
      '¿Cuánto gasto al mes?'
    )
  })

  it('should return 400 for empty query', async () => {
    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: '' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('provide a query')
  })

  it('should return 400 for whitespace-only query', async () => {
    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: '   ' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('provide a query')
  })

  it('should return 400 for query exceeding 500 characters', async () => {
    const longQuery = 'a'.repeat(501)

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: longQuery })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('too long')
    expect(response.body.message).toContain('500')
  })

  it('should return 400 for missing query field', async () => {
    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should handle API key errors', async () => {
    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error('API key not found'))

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'Test query' })
      .expect(500)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('configuration error')
  })

  it('should handle rate limit errors', async () => {
    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error('Rate limit exceeded'))

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'Test query' })
      .expect(429)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Too many requests')
  })

  it('should return 401 without authentication', async () => {
    const response = await request(app)
      .post('/api/ai/query')
      .send({ query: 'Test query' })
      .expect(401)

    expect(response.body.success).toBe(false)
  })

  it('should accept query at exactly 500 characters', async () => {
    const mockAnswer = 'Respuesta para query de 500 caracteres.'
    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockAnswer)

    const exactQuery = 'a'.repeat(500)

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: exactQuery })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.answer).toBe(mockAnswer)
  })

  it('should handle queries with special characters', async () => {
    const mockAnswer = 'Respuesta con caracteres especiales.'
    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockAnswer)

    const specialQuery = '¿Cuánto gasté en café & té? $100 - €80'

    const response = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: specialQuery })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(ClaudeService.prototype.query).toHaveBeenCalledWith(
      userId,
      specialQuery
    )
  })
})

describe('AI Controller - GET /api/ai/suggestions', () => {
  it('should get AI suggestions successfully', async () => {
    const mockSuggestions = [
      '¿Cuánto gasté este mes?',
      '¿En qué categoría gasto más?',
      'Muéstrame mi balance actual',
      '¿Cómo puedo ahorrar más?'
    ]

    ;(ClaudeService.prototype.generateSuggestedQuestions as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockSuggestions)

    const response = await request(app)
      .get('/api/ai/suggestions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.suggestions).toEqual(mockSuggestions)
    expect(response.body.suggestions).toHaveLength(4)

    // Verificar que se llamó al servicio
    expect(
      ClaudeService.prototype.generateSuggestedQuestions
    ).toHaveBeenCalledWith(userId)
  })

  it('should return 401 without authentication', async () => {
    const response = await request(app).get('/api/ai/suggestions').expect(401)

    expect(response.body.success).toBe(false)
  })

  it('should handle service errors gracefully', async () => {
    ;(ClaudeService.prototype.generateSuggestedQuestions as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error('Service error'))

    const response = await request(app)
      .get('/api/ai/suggestions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(500)

    // El error debería ser manejado por el errorHandler middleware
    expect(response.body.success).toBe(false)
  })

  it('should return empty array if no suggestions available', async () => {
    ;(ClaudeService.prototype.generateSuggestedQuestions as jest.Mock) = jest
      .fn()
      .mockResolvedValue([])

    const response = await request(app)
      .get('/api/ai/suggestions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.suggestions).toEqual([])
  })

  it('should handle different user contexts', async () => {
    // Crear otro usuario
    const otherUser = await User.create({
      email: 'other@test.com',
      password: 'Password123!',
      name: 'Other User'
    })

    const otherToken = generateToken(otherUser._id.toString())
    const otherSuggestions = ['Pregunta para otro usuario']

    ;(ClaudeService.prototype.generateSuggestedQuestions as jest.Mock) = jest
      .fn()
      .mockResolvedValue(otherSuggestions)

    const response = await request(app)
      .get('/api/ai/suggestions')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(
      ClaudeService.prototype.generateSuggestedQuestions
    ).toHaveBeenCalledWith(otherUser._id.toString())
  })
})

describe('AI Controller - Integration Tests', () => {
  it('should handle multiple consecutive queries', async () => {
    const mockAnswer1 = 'Primera respuesta'
    const mockAnswer2 = 'Segunda respuesta'

    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockResolvedValueOnce(mockAnswer1)
      .mockResolvedValueOnce(mockAnswer2)

    // Primera query
    const response1 = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'Primera pregunta' })
      .expect(200)

    expect(response1.body.answer).toBe(mockAnswer1)

    // Segunda query
    const response2 = await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'Segunda pregunta' })
      .expect(200)

    expect(response2.body.answer).toBe(mockAnswer2)
    expect(ClaudeService.prototype.query).toHaveBeenCalledTimes(2)
  })

  it('should maintain separate contexts for different users', async () => {
    // Crear otro usuario
    const otherUser = await User.create({
      email: 'separate@test.com',
      password: 'Password123!',
      name: 'Separate User'
    })

    const otherToken = generateToken(otherUser._id.toString())

    ;(ClaudeService.prototype.query as jest.Mock) = jest
      .fn()
      .mockResolvedValue('Respuesta genérica')

    // Query del primer usuario
    await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ query: 'User 1 query' })
      .expect(200)

    // Query del segundo usuario
    await request(app)
      .post('/api/ai/query')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ query: 'User 2 query' })
      .expect(200)

    // Verificar que se llamó con diferentes userIds
    const calls = (ClaudeService.prototype.query as jest.Mock).mock.calls
    expect(calls[0][0]).toBe(userId)
    expect(calls[1][0]).toBe(otherUser._id.toString())
  })
})
