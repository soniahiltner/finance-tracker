import type { Request, Response, NextFunction } from 'express'
import { errorHandler } from '../middleware/errorHandler.js'
import type { ApiError } from '../middleware/errorHandler.js'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let statusCode: number
  let responseBody: any

  beforeEach(() => {
    statusCode = 0
    responseBody = null

    mockRequest = {
      path: '/api/test',
      method: 'GET'
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

    mockNext = (() => {}) as NextFunction
  })

  it('should handle errors with custom status code', () => {
    const error: ApiError = new Error('Test error')
    error.statusCode = 404

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(statusCode).toBe(404)
    expect(responseBody).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Test error'
      })
    )
  })

  it('should default to 500 status code if not specified', () => {
    const error: ApiError = new Error('Internal error')

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(statusCode).toBe(500)
  })

  it('should include stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const error: ApiError = new Error('Dev error')
    error.statusCode = 400

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(responseBody).toHaveProperty('stack')
    expect(typeof responseBody.stack).toBe('string')

    process.env.NODE_ENV = originalEnv
  })

  it('should not include stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const error: ApiError = new Error('Prod error')
    error.statusCode = 500

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(responseBody).not.toHaveProperty('stack')

    process.env.NODE_ENV = originalEnv
  })

  it('should handle errors with additional error details', () => {
    const error: ApiError = new Error('Validation error')
    error.statusCode = 422
    error.errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' }
    ]

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(responseBody).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' }
        ]
      })
    )
  })

  it('should use default message for errors without message', () => {
    const error = new Error() as ApiError

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(responseBody).toEqual(
      expect.objectContaining({
        message: 'Internal Server Error'
      })
    )
  })

  it('should always set success to false', () => {
    const error: ApiError = new Error('Any error')
    error.statusCode = 400

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )

    expect(responseBody.success).toBe(false)
  })
})
