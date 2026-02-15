import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType } from 'zod'

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })

      if (parsed && typeof parsed === 'object') {
        const parsedRecord = parsed as {
          body?: unknown
          query?: unknown
          params?: unknown
        }

        if (parsedRecord.body && typeof parsedRecord.body === 'object') {
          req.body = parsedRecord.body
        }

        if (parsedRecord.query && typeof parsedRecord.query === 'object') {
          req.query = parsedRecord.query as Request['query']
        }

        if (parsedRecord.params && typeof parsedRecord.params === 'object') {
          req.params = parsedRecord.params as Request['params']
        }
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))

        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        })
      }

      next(error)
    }
  }
