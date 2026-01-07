import type { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Transaction } from '../models/index.js'
import { type AuthRequest } from '../middleware/auth.js'
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQuery
} from '../types/transaction.types.js'

// @desc    Obtener todas las transacciones del usuario
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const { month, year, category, type, startDate, endDate } =
      req.query as TransactionQuery

    // Construir filtros
    const filters: any = { userId }

    if (type) {
      filters.type = type
    }

    if (category) {
      filters.category = category
    }

    // Filtrar por mes y año
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endOfMonth = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59
      )
      filters.date = { $gte: startOfMonth, $lte: endOfMonth }
    }

    // Filtrar por rango de fechas personalizado
    if (startDate || endDate) {
      filters.date = {}
      if (startDate) filters.date.$gte = new Date(startDate)
      if (endDate) filters.date.$lte = new Date(endDate)
    }

    const transactions = await Transaction.find(filters)
      .sort({ date: -1 })
      .lean()

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    })
  } catch (error) {
    console.error('GetTransactions error:', error)
    next(error)
  }
}

// @desc    Obtener una transacción por ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Verificar que la transacción pertenece al usuario
    if (transaction.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      })
    }

    res.status(200).json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('GetTransaction error:', error)
    next(error)
  }
}

// @desc    Crear nueva transacción
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, amount, category, description, date } =
      req.body as CreateTransactionRequest

    // Validar campos requeridos
    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, amount and category'
      })
    }

    // Validar tipo
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense'
      })
    }

    // Validar amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      })
    }

    const transaction = await Transaction.create({
      userId: req.user!.id,
      type,
      amount,
      category,
      description: description || '',
      date: date || new Date()
    })

    res.status(201).json({
      success: true,
      data: transaction
    })
  } catch (error: any) {
    console.error('CreateTransaction error:', error)

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

// @desc    Actualizar transacción
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Verificar que la transacción pertenece al usuario
    if (transaction.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction'
      })
    }

    const updates = req.body as UpdateTransactionRequest

    // Validar amount si se proporciona
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      })
    }

    // Actualizar campos
    transaction = await Transaction.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('UpdateTransaction error:', error)
    next(error)
  }
}

// @desc    Eliminar transacción
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction = await Transaction.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Verificar que la transacción pertenece al usuario
    if (transaction.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      })
    }

    await Transaction.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    console.error('DeleteTransaction error:', error)
    next(error)
  }
}

// @desc    Obtener resumen/estadísticas de transacciones
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionsSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const { month, year, startDate, endDate } = req.query

    // Construir filtros de fecha
    let dateFilter: any = {}

    if (month && year) {
      const startOfMonth = new Date(
        parseInt(year as string),
        parseInt(month as string) - 1,
        1
      )
      const endOfMonth = new Date(
        parseInt(year as string),
        parseInt(month as string),
        0,
        23,
        59,
        59
      )
      dateFilter = { date: { $gte: startOfMonth, $lte: endOfMonth } }
    } else if (startDate || endDate) {
      dateFilter.date = {}
      if (startDate) dateFilter.date.$gte = new Date(startDate as string)
      if (endDate) dateFilter.date.$lte = new Date(endDate as string)
    }

    // Agregar por categoría
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ])

    // Calcular totales
    const totals = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ])

    const totalIncome = totals.find((t) => t._id === 'income')?.total || 0
    const totalExpenses = totals.find((t) => t._id === 'expense')?.total || 0

    // Agregar por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const byMonth = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    // Formatear datos por mes
    const monthlyData: any = {}
    byMonth.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, income: 0, expenses: 0, balance: 0 }
      }
      if (item._id.type === 'income') {
        monthlyData[key].income = item.total
      } else {
        monthlyData[key].expenses = item.total
      }
      monthlyData[key].balance =
        monthlyData[key].income - monthlyData[key].expenses
    })

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        byCategory,
        byMonth: Object.values(monthlyData)
      }
    })
  } catch (error) {
    console.error('GetTransactionsSummary error:', error)
    next(error)
  }
}
