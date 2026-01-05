import express from 'express'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/categoryController.js'
import { protect } from '../middleware/auth.js'


const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

// IMPORTANTE: /stats debe ir ANTES de /:id
router.get('/stats', getCategoryStats)

router.route('/').get(getCategories).post(createCategory)

router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory)

export default router