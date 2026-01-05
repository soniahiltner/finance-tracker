import express from 'express'
import { queryAI, getSuggestions } from '../controllers/aiController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

router.post('/query', queryAI)
router.get('/suggestions', getSuggestions)

export default router
