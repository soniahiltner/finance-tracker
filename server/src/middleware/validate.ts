import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodSchema } from 'zod'

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
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
