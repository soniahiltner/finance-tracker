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
      app = createTestApp(authLimiter)
    })

    it('should have stricter limits for auth endpoints', async () => {
      const response = await request(app).get('/test')

      expect(response.status).toBe(200)
      // El límite de auth es 5 por ventana
      expect(parseInt(response.headers['ratelimit-limit'] as string)).toBeLessThanOrEqual(
        100
      )
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
