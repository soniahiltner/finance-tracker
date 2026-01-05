import type { Response, NextFunction } from 'express'
import { Category } from '../models/index.js'
import {type AuthRequest } from '../middleware/auth.js'
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../types/category.types.js'


// @desc    Obtener todas las categorías (default + custom del usuario)
// @route   GET /api/categories
// @access  Private
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const { type } = req.query

    // Construir filtro
    const filter: any = {
      $or: [
        { isDefault: true }, // Categorías default (para todos)
        { userId: userId } // Categorías custom del usuario
      ]
    }

    // Filtrar por tipo si se especifica
    if (type === 'income' || type === 'expense') {
      filter.type = type
    }

    const categories = await Category.find(filter)
      .sort({ isDefault: -1, name: 1 }) // Primero default, luego alfabético
      .lean()

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    })
  } catch (error) {
    console.error('GetCategories error:', error)
    next(error)
  }
}

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // Verificar acceso: default o del usuario
    if (!category.isDefault && category.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this category'
      })
    }

    res.status(200).json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('GetCategory error:', error)
    next(error)
  }
}

// @desc    Crear categoría custom
// @route   POST /api/categories
// @access  Private
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, type, icon, color } = req.body as CreateCategoryRequest

    // Validar campos requeridos
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and type'
      })
    }

    // Validar tipo
    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense'
      })
    }

    // Verificar si ya existe una categoría con ese nombre para el usuario
    const existingCategory = await Category.findOne({
      name: name.trim(),
      type,
      $or: [{ isDefault: true }, { userId: req.user!.id }]
    })

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `A ${type} category with the name "${name}" already exists`
      })
    }

    // Crear categoría custom
    const category = await Category.create({
      name: name.trim(),
      type,
      icon: icon || 'circle',
      color: color || '#6366f1',
      isDefault: false,
      userId: req.user!.id
    })

    res.status(201).json({
      success: true,
      data: category
    })
  } catch (error: any) {
    console.error('CreateCategory error:', error)

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

// @desc    Actualizar categoría custom
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // No se pueden editar categorías default
    if (category.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit default categories'
      })
    }

    // Verificar que la categoría pertenece al usuario
    if (category.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this category'
      })
    }

    const updates = req.body as UpdateCategoryRequest

    // Si se actualiza el nombre, verificar que no exista
    if (updates.name) {
      const existingCategory = await Category.findOne({
        name: updates.name.trim(),
        type: category.type,
        _id: { $ne: category._id }, // Excluir la categoría actual
        $or: [{ isDefault: true }, { userId: req.user!.id }]
      })

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: `A category with the name "${updates.name}" already exists`
        })
      }
    }

    // Actualizar categoría
    category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('UpdateCategory error:', error)
    next(error)
  }
}

// @desc    Eliminar categoría custom
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // No se pueden eliminar categorías default
    if (category.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default categories'
      })
    }

    // Verificar que la categoría pertenece al usuario
    if (category.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this category'
      })
    }

    // Verificar si hay transacciones usando esta categoría
    const { Transaction } = await import('../models/index.js')
    const transactionsCount = await Transaction.countDocuments({
      userId: req.user!.id,
      category: category.name
    })

    if (transactionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${transactionsCount} transaction(s) are using it. Please reassign or delete those transactions first.`
      })
    }

    await Category.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('DeleteCategory error:', error)
    next(error)
  }
}

// @desc    Obtener estadísticas de uso de categorías
// @route   GET /api/categories/stats
// @access  Private
export const getCategoryStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const { Transaction } = await import('../models/index.js')

    // Obtener uso de cada categoría
    const categoryUsage = await Transaction.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    // Obtener todas las categorías del usuario
    const allCategories = await Category.find({
      $or: [{ isDefault: true }, { userId: userId }]
    }).lean()

    // Combinar datos
    const stats = allCategories.map((cat) => {
      const usage = categoryUsage.find((u) => u._id === cat.name)
      return {
        ...cat,
        transactionCount: usage?.count || 0,
        totalAmount: usage?.totalAmount || 0
      }
    })

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('GetCategoryStats error:', error)
    next(error)
  }
}