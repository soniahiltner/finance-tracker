import request from 'supertest'
import express, { type Application } from 'express'
import {
  apiLimiter,
  authLimiter,
  aiLimiter
} from '../middleware/rateLimiter.js'

const createTestApp = (limiter: any): Application => {
  const app = express()
  app.use(limiter)
  app.get('/test', (req, res) => {
    res.json({ success: true })
  })
  return app
}

describe('Rate Limiter Middleware', () => {
  describe('API Limiter', () => {
    let app: Application

    beforeEach(() => {
      app = createTestApp(apiLimiter)
    })

    it('should allow requests under the limit', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/test')
        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      }
    })

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/test')

      expect(response.headers).toHaveProperty('ratelimit-limit')
      expect(response.headers).toHaveProperty('ratelimit-remaining')
      expect(response.headers).toHaveProperty('ratelimit-reset')
    })
  })

  describe('Auth Limiter', () => {
    let app: Application

    beforeEach(() => {
      app = express()
      app.use(express.json())
      app.use(authLimiter)
      app.post('/login', (req, res) => {
        res.status(401).json({ success: false, message: 'Invalid credentials' })
      })
    })

    it('should have stricter limits for auth endpoints', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrong-password' })

      expect(response.status).toBe(401)
      // El límite de auth es 5 por ventana
      expect(
        parseInt(response.headers['ratelimit-limit'] as string)
      ).toBeLessThanOrEqual(100)
    })

    it('should return retryAfter when auth limit is exceeded', async () => {
      const email = 'lockout@example.com'

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send({ email, password: 'wrong-password' })
          .expect(401)
      }

      const limitedResponse = await request(app)
        .post('/login')
        .send({ email, password: 'wrong-password' })
        .expect(429)

      expect(limitedResponse.body.success).toBe(false)
      expect(limitedResponse.body.message).toContain('Demasiados intentos')
      expect(typeof limitedResponse.body.retryAfter).toBe('number')
      expect(limitedResponse.body.retryAfter).toBeGreaterThan(0)
    })
  })

  describe('AI Limiter', () => {
    let app: Application

    beforeEach(() => {
      app = createTestApp(aiLimiter)
    })

    it('should have the most restrictive limits', async () => {
      const response = await request(app).get('/test')

      expect(response.status).toBe(200)
      // El límite de AI es 20 por hora
      const limit = parseInt(response.headers['ratelimit-limit'] as string)
      expect(limit).toBeLessThanOrEqual(100)
    })
  })
})
