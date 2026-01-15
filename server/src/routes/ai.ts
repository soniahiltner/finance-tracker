import express from 'express'
import { queryAI, getSuggestions } from '../controllers/aiController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { aiChatSchema } from '../validation/schemas.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

router.post('/query', validate(aiChatSchema), queryAI)
router.get('/suggestions', getSuggestions)

export default router
