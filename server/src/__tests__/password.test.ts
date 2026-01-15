import bcrypt from 'bcryptjs'

describe('Password Hashing', () => {
  it('should hash passwords correctly', async () => {
    const password = 'testPassword123'
    const hashedPassword = await bcrypt.hash(password, 10)

    expect(hashedPassword).toBeDefined()
    expect(hashedPassword).not.toBe(password)
    expect(hashedPassword.length).toBeGreaterThan(50)
  })

  it('should verify correct password', async () => {
    const password = 'correctPassword'
    const hashedPassword = await bcrypt.hash(password, 10)

    const isMatch = await bcrypt.compare(password, hashedPassword)
    expect(isMatch).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'correctPassword'
    const wrongPassword = 'wrongPassword'
    const hashedPassword = await bcrypt.hash(password, 10)

    const isMatch = await bcrypt.compare(wrongPassword, hashedPassword)
    expect(isMatch).toBe(false)
  })

  it('should generate different hashes for same password', async () => {
    const password = 'samePassword'
    const hash1 = await bcrypt.hash(password, 10)
    const hash2 = await bcrypt.hash(password, 10)

    expect(hash1).not.toBe(hash2)

    // Pero ambos deben verificar correctamente
    expect(await bcrypt.compare(password, hash1)).toBe(true)
    expect(await bcrypt.compare(password, hash2)).toBe(true)
  })

  it('should handle empty strings', async () => {
    const emptyPassword = ''
    const hashedPassword = await bcrypt.hash(emptyPassword, 10)

    expect(hashedPassword).toBeDefined()
    expect(await bcrypt.compare('', hashedPassword)).toBe(true)
    expect(await bcrypt.compare('notEmpty', hashedPassword)).toBe(false)
  })

  it('should handle special characters in passwords', async () => {
    const specialPassword = 'P@ssw0rd!#$%^&*()'
    const hashedPassword = await bcrypt.hash(specialPassword, 10)

    expect(await bcrypt.compare(specialPassword, hashedPassword)).toBe(true)
    expect(await bcrypt.compare('P@ssw0rd', hashedPassword)).toBe(false)
  })
})
