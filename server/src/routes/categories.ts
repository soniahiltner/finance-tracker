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
import { validate } from '../middleware/validate.js'
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema
} from '../validation/schemas.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(protect)

// IMPORTANTE: /stats debe ir ANTES de /:id
router.get('/stats', getCategoryStats)

router
  .route('/')
  .get(getCategories)
  .post(validate(createCategorySchema), createCategory)

router
  .route('/:id')
  .get(getCategory)
  .put(validate(updateCategorySchema), updateCategory)
  .delete(validate(deleteCategorySchema), deleteCategory)

export default router
