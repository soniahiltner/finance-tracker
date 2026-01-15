import express from 'express'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary
} from '../controllers/transactionController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  getTransactionSchema,
  transactionQuerySchema
} from '../validation/schemas.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

// IMPORTANTE: /summary debe ir ANTES de /:id
router.get('/summary', validate(transactionQuerySchema), getTransactionsSummary)

router
  .route('/')
  .get(validate(transactionQuerySchema), getTransactions)
  .post(validate(createTransactionSchema), createTransaction)

router
  .route('/:id')
  .get(validate(getTransactionSchema), getTransaction)
  .put(validate(updateTransactionSchema), updateTransaction)
  .delete(validate(deleteTransactionSchema), deleteTransaction)

export default router
