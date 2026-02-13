import express from 'express'
import {
  queryAI,
  getSuggestions,
  getWelcomeMessage,
  importDocument,
  processVoiceTransaction
} from '../controllers/aiController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { aiChatSchema, voiceTransactionSchema } from '../validation/schemas.js'
import { upload, handleMulterError } from '../middleware/upload.js'
import { aiQueryLimiter, aiReadLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

router.post('/query', aiQueryLimiter, validate(aiChatSchema), queryAI)
router.get('/suggestions', aiReadLimiter, getSuggestions)
router.get('/welcome', aiReadLimiter, getWelcomeMessage)
router.post(
  '/import-document',
  aiQueryLimiter,
  upload.single('file'),
  handleMulterError,
  importDocument
)
router.post(
  '/voice-transaction',
  aiQueryLimiter,
  validate(voiceTransactionSchema),
  processVoiceTransaction
)

export default router
