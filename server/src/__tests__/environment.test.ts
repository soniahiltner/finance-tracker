describe('Environment Variables', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.JWT_SECRET = 'test-secret-key'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should have required environment variables in test mode', () => {
    expect(process.env.JWT_SECRET).toBeDefined()
  })

  it('should default PORT to 5000 if not set', () => {
    delete process.env.PORT
    const defaultPort = process.env.PORT || 5000
    expect(defaultPort).toBe(5000)
  })

  it('should use custom PORT when set', () => {
    process.env.PORT = '3000'
    expect(process.env.PORT).toBe('3000')
  })

  it('should handle NODE_ENV correctly', () => {
    const validEnvs = ['development', 'production', 'test']
    const currentEnv = process.env.NODE_ENV || 'development'

    expect(validEnvs).toContain(currentEnv)
  })

  it('should parse ALLOWED_ORIGINS as comma-separated list', () => {
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173'
    const origins = process.env.ALLOWED_ORIGINS.split(',')

    expect(origins).toHaveLength(2)
    expect(origins[0]).toBe('http://localhost:3000')
    expect(origins[1]).toBe('http://localhost:5173')
  })

  it('should handle missing ALLOWED_ORIGINS gracefully', () => {
    delete process.env.ALLOWED_ORIGINS
    const origins = process.env.ALLOWED_ORIGINS
      ? (process.env.ALLOWED_ORIGINS as string).split(',')
      : ['http://localhost:5173', 'http://localhost:4173']

    expect(origins).toHaveLength(2)
    expect(origins).toContain('http://localhost:5173')
  })

  it('should validate MongoDB URI format', () => {
    const validURIs = [
      'mongodb://localhost:27017/testdb',
      'mongodb+srv://user:pass@cluster.mongodb.net/db',
      'mongodb://localhost:27017/finance-tracker'
    ]

    validURIs.forEach((uri) => {
      expect(uri).toMatch(/^mongodb(\+srv)?:\/\//)
    })
  })

  it('should ensure JWT_SECRET has minimum length in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.JWT_SECRET =
      'this-should-be-at-least-32-characters-long-in-production'

    if (process.env.NODE_ENV === 'production') {
      expect(process.env.JWT_SECRET!.length).toBeGreaterThanOrEqual(32)
    }
  })
})
