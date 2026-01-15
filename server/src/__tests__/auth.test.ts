import { generateToken } from '../utils/generateToken.js'
import jwt from 'jsonwebtoken'

// Mock del process.env
const originalEnv = process.env

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
})

afterAll(() => {
  process.env = originalEnv
})

describe('JWT Token Generation', () => {
  it('should generate a valid JWT token', () => {
    const userId = 'user123'
    const token = generateToken(userId)

    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT tiene 3 partes
  })

  it('should include userId in token payload', () => {
    const userId = 'user456'
    const token = generateToken(userId)

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    expect(decoded.id).toBe(userId)
  })

  it('should create tokens that expire in 30 days', () => {
    const userId = 'user789'
    const token = generateToken(userId)

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      exp: number
      iat: number
    }

    const expectedExpiration = 30 * 24 * 60 * 60 // 30 days in seconds
    const actualExpiration = decoded.exp - decoded.iat

    // Permitir 1 segundo de diferencia por redondeo
    expect(Math.abs(actualExpiration - expectedExpiration)).toBeLessThan(2)
  })

  it('should generate different tokens for different users', () => {
    const token1 = generateToken('user1')
    const token2 = generateToken('user2')

    expect(token1).not.toBe(token2)
  })
})
