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

const router = express.Router()

router.use(protect)

// Stats debe ir antes de /:id
router.get('/stats', getGoalsStats)

router.route('/').get(getSavingsGoals).post(createSavingsGoal)

router
  .route('/:id')
  .get(getSavingsGoal)
  .put(updateSavingsGoal)
  .delete(deleteSavingsGoal)

router.post('/:id/progress', addProgress)

export default router
