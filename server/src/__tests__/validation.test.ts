import { validate } from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  createTransactionSchema
} from '../validation/schemas.js'
import type { Request, Response, NextFunction } from 'express'

describe('Zod Validation Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: jest.Mock
  let statusCode: number
  let responseBody: any

  beforeEach(() => {
    statusCode = 0
    responseBody = null

    mockRequest = {
      body: {},
      query: {},
      params: {}
    }

    mockResponse = {
      status: function (code: number) {
        statusCode = code
        return this
      },
      json: function (body: any) {
        responseBody = body
        return this
      }
    } as Partial<Response>

    mockNext = (() => {}) as any
  })

  describe('Register Schema', () => {
    it('should pass with valid registration data', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(0) // No error response
    })

    it('should reject invalid email', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.success).toBe(false)
      expect(responseBody.errors).toBeDefined()
      expect(responseBody.errors[0].field).toContain('email')
    })

    it('should reject short password', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '12345',
        name: 'Test User'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('password')
      expect(responseBody.errors[0].message).toContain('6 caracteres')
    })

    it('should reject short name', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'A'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('name')
    })

    it('should reject missing fields', async () => {
      mockRequest.body = {
        email: 'test@example.com'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Login Schema', () => {
    it('should pass with valid login data', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      }

      const middleware = validate(loginSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(0)
    })

    it('should reject invalid email format', async () => {
      mockRequest.body = {
        email: 'not-an-email',
        password: 'password123'
      }

      const middleware = validate(loginSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].message).toContain('Email inválido')
    })
  })

  describe('Transaction Schema', () => {
    it('should pass with valid transaction data', async () => {
      mockRequest.body = {
        type: 'expense',
        amount: 100.5,
        category: 'Food',
        description: 'Lunch',
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(0)
    })

    it('should reject invalid transaction type', async () => {
      mockRequest.body = {
        type: 'invalid',
        amount: 100,
        category: 'Food',
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('type')
    })

    it('should reject negative amount', async () => {
      mockRequest.body = {
        type: 'expense',
        amount: -50,
        category: 'Food',
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('amount')
      expect(responseBody.errors[0].message).toContain('mayor a 0')
    })

    it('should reject zero amount', async () => {
      mockRequest.body = {
        type: 'expense',
        amount: 0,
        category: 'Food',
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('amount')
    })

    it('should accept optional description', async () => {
      mockRequest.body = {
        type: 'income',
        amount: 500,
        category: 'Salary',
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(0)
    })

    it('should reject too long description', async () => {
      mockRequest.body = {
        type: 'expense',
        amount: 100,
        category: 'Food',
        description: 'A'.repeat(501),
        date: new Date().toISOString()
      }

      const middleware = validate(createTransactionSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(statusCode).toBe(400)
      expect(responseBody.errors[0].field).toContain('description')
    })
  })

  describe('Error Formatting', () => {
    it('should format validation errors correctly', async () => {
      mockRequest.body = {
        email: 'invalid',
        password: '123'
      }

      const middleware = validate(registerSchema)
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      )

      expect(responseBody).toEqual(
        expect.objectContaining({
          success: false,
          message: 'Errores de validación',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String)
            })
          ])
        })
      )
    })
  })
})
