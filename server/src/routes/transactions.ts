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

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

// IMPORTANTE: /summary debe ir ANTES de /:id
router.get('/summary', getTransactionsSummary)

router.route('/').get(getTransactions).post(createTransaction)

router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction)

export default router