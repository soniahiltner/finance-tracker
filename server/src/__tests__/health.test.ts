import request from 'supertest'
import express, { type Application } from 'express'

// Crear una mini app solo para el health check
const createTestApp = (): Application => {
  const app = express()
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    })
  })
  return app
}

describe('Health Check Endpoint', () => {
  let app: Application

  beforeAll(() => {
    app = createTestApp()
  })

  it('should return 200 and success message', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('message', 'Server is running')
    expect(response.body).toHaveProperty('timestamp')
  })

  it('should return a valid timestamp', async () => {
    const response = await request(app).get('/health')

    const timestamp = new Date(response.body.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.getTime()).not.toBeNaN()
  })
})
