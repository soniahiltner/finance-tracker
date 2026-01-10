import type { Response, NextFunction } from 'express'
import { SavingsGoal } from '../models/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import type {
  CreateSavingsGoalRequest,
  UpdateSavingsGoalRequest,
  AddProgressRequest
} from '../types/savingsGoal.types.js'

// @desc    Obtener todas las metas del usuario
// @route   GET /api/savings-goals
// @access  Private
export const getSavingsGoals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const { status } = req.query // 'active', 'completed', 'all'

    const filter: any = { userId }

    if (status === 'active') {
      filter.isCompleted = false
    } else if (status === 'completed') {
      filter.isCompleted = true
    }

    const goals = await SavingsGoal.find(filter)
      .sort({ isCompleted: 1, deadline: 1 })
      .lean()

    // Añadir virtuals manualmente
    const goalsWithVirtuals = goals.map((goal) => ({
      ...goal,
      progress: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
      daysRemaining: Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    }))

    res.status(200).json({
      success: true,
      count: goalsWithVirtuals.length,
      data: goalsWithVirtuals
    })
  } catch (error) {
    console.error('GetSavingsGoals error:', error)
    next(error)
  }
}

// @desc    Obtener una meta por ID
// @route   GET /api/savings-goals/:id
// @access  Private
export const getSavingsGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      })
    }

    if (goal.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      })
    }

    res.status(200).json({
      success: true,
      data: goal
    })
  } catch (error) {
    console.error('GetSavingsGoal error:', error)
    next(error)
  }
}

// @desc    Crear nueva meta
// @route   POST /api/savings-goals
// @access  Private
export const createSavingsGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      color,
      icon
    } = req.body as CreateSavingsGoalRequest

    // Validaciones
    if (!name || !targetAmount || !deadline || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, target amount, deadline and category'
      })
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      })
    }

    const deadlineDate = new Date(deadline)
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be in the future'
      })
    }

    const goal = await SavingsGoal.create({
      userId: req.user!.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadlineDate,
      category,
      color: color || '#3b82f6',
      icon: icon || 'target'
    })

    res.status(201).json({
      success: true,
      data: goal
    })
  } catch (error: any) {
    console.error('CreateSavingsGoal error:', error)

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      )
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      })
    }

    next(error)
  }
}

// @desc    Actualizar meta
// @route   PUT /api/savings-goals/:id
// @access  Private
export const updateSavingsGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let goal = await SavingsGoal.findById(req.params.id)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      })
    }

    if (goal.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      })
    }

    const updates = req.body as UpdateSavingsGoalRequest

    // Validar deadline si se actualiza
    if (updates.deadline) {
      const deadlineDate = new Date(updates.deadline)
      if (deadlineDate <= new Date() && !goal.isCompleted) {
        return res.status(400).json({
          success: false,
          message: 'Deadline must be in the future'
        })
      }
    }

    goal = await SavingsGoal.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: goal
    })
  } catch (error) {
    console.error('UpdateSavingsGoal error:', error)
    next(error)
  }
}

// @desc    Añadir progreso a una meta
// @route   POST /api/savings-goals/:id/progress
// @access  Private
export const addProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      })
    }

    if (goal.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      })
    }

    const { amount } = req.body as AddProgressRequest

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      })
    }

    goal.currentAmount += amount
    await goal.save()

    res.status(200).json({
      success: true,
      data: goal,
      message: goal.isCompleted
        ? '🎉 ¡Meta completada!'
        : 'Progreso añadido exitosamente'
    })
  } catch (error) {
    console.error('AddProgress error:', error)
    next(error)
  }
}

// @desc    Eliminar meta
// @route   DELETE /api/savings-goals/:id
// @access  Private
export const deleteSavingsGoal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id)

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      })
    }

    if (goal.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      })
    }

    await SavingsGoal.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully'
    })
  } catch (error) {
    console.error('DeleteSavingsGoal error:', error)
    next(error)
  }
}

// @desc    Obtener estadísticas de metas
// @route   GET /api/savings-goals/stats
// @access  Private
export const getGoalsStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id

    const goals = await SavingsGoal.find({ userId }).lean()

    const stats = {
      total: goals.length,
      active: goals.filter((g) => !g.isCompleted).length,
      completed: goals.filter((g) => g.isCompleted).length,
      totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalSaved: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress:
        goals.length > 0
          ? goals.reduce(
              (sum, g) => sum + (g.currentAmount / g.targetAmount) * 100,
              0
            ) / goals.length
          : 0
    }

    res.status(200).json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('GetGoalsStats error:', error)
    next(error)
  }
}
