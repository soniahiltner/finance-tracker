import type { Request, Response, NextFunction } from 'express'
import logger from '../config/logger.js'

export interface ApiError extends Error {
  statusCode?: number
  errors?: any[]
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error('API Error:', {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
