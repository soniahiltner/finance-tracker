import type { Request, Response, NextFunction } from 'express'
import { User } from '../models/index.js'
import { generateToken } from '../utils/generateToken.js'
import type { RegisterRequest, LoginRequest } from '../types/auth.types.js'
import { type AuthRequest } from '../middleware/auth.js'

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password and name'
      })
    }

    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Crear usuario (el password se hashea automáticamente en el modelo)
    const user = await User.create({
      email,
      password,
      name
    })

    // Generar token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      },
      token
    })
  } catch (error: any) {
    console.error('Register error:', error)

    // Manejar errores de validación de Mongoose
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

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Buscar usuario e incluir password (normalmente está excluido)
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Verificar password
    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generar token
    const token = generateToken(user._id.toString())

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    next(error)
  }
}



// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // El usuario ya viene del middleware protect
    const user = await User.findById(req.user!.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('GetMe error:', error)
    next(error)
  }
}

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body

    const user = await User.findById(req.user!.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Actualizar solo los campos proporcionados
    if (name) user.name = name
    if (email) {
      // Verificar si el nuevo email ya existe
      const emailExists = await User.findOne({ email })
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        })
      }
      user.email = email
    }

    await user.save()

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('UpdateProfile error:', error)
    next(error)
  }
}


// @desc    Cambiar password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      })
    }

    const user = await User.findById(req.user!.id).select('+password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verificar password actual
    const isPasswordCorrect = await user.comparePassword(currentPassword)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Actualizar password (se hasheará automáticamente)
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('ChangePassword error:', error)
    next(error)
  }
}


