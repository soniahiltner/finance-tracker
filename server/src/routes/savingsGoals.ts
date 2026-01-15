import express from 'express'
import {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  addProgress,
  deleteSavingsGoal,
  getGoalsStats
} from '../controllers/savingsGoalController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addProgressSchema,
  deleteSavingsGoalSchema
} from '../validation/schemas.js'

const router = express.Router()

router.use(protect)

// Stats debe ir antes de /:id
router.get('/stats', getGoalsStats)

router
  .route('/')
  .get(getSavingsGoals)
  .post(validate(createSavingsGoalSchema), createSavingsGoal)

router
  .route('/:id')
  .get(getSavingsGoal)
  .put(validate(updateSavingsGoalSchema), updateSavingsGoal)
  .delete(validate(deleteSavingsGoalSchema), deleteSavingsGoal)

router.post('/:id/progress', validate(addProgressSchema), addProgress)

export default router
