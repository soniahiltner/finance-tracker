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

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

router.post('/query', validate(aiChatSchema), queryAI)
router.get('/suggestions', getSuggestions)
router.get('/welcome', getWelcomeMessage)
router.post(
  '/import-document',
  upload.single('file'),
  handleMulterError,
  importDocument
)
router.post(
  '/voice-transaction',
  validate(voiceTransactionSchema),
  processVoiceTransaction
)

export default router
