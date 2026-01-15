import jwt from 'jsonwebtoken'

// Test de JWT verification sin dependencias de modelos
describe('Auth Middleware - JWT Verification', () => {
  const JWT_SECRET = 'test-secret-key'

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET
  })

  it('should verify valid JWT token', () => {
    const userId = 'user123'
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' })

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    expect(decoded.id).toBe(userId)
  })

  it('should reject token with wrong secret', () => {
    const token = jwt.sign({ id: 'user123' }, 'wrong-secret', {
      expiresIn: '30d'
    })

    expect(() => {
      jwt.verify(token, JWT_SECRET)
    }).toThrow()
  })

  it('should reject malformed token', () => {
    const malformedToken = 'not.a.valid.jwt'

    expect(() => {
      jwt.verify(malformedToken, JWT_SECRET)
    }).toThrow()
  })

  it('should decode token payload correctly', () => {
    const payload = { id: 'user123', email: 'test@example.com' }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })

    const decoded = jwt.verify(token, JWT_SECRET) as any
    expect(decoded.id).toBe(payload.id)
    expect(decoded.email).toBe(payload.email)
    expect(decoded).toHaveProperty('iat')
    expect(decoded).toHaveProperty('exp')
  })

  it('should include expiration timestamp in token', () => {
    const userId = 'user789'
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      exp: number
      iat: number
    }

    const expectedExpiration = 7 * 24 * 60 * 60 // 7 days in seconds
    const actualExpiration = decoded.exp - decoded.iat

    // Permitir 1 segundo de diferencia por redondeo
    expect(Math.abs(actualExpiration - expectedExpiration)).toBeLessThan(2)
  })
})
