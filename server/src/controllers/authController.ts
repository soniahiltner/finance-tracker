import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { generateToken } from '../utils/generateToken.js'
import type { RegisterRequest, LoginRequest } from '../types/auth.types.js'
import { type AuthRequest } from '../middleware/auth.js'
import { sendPasswordResetEmail } from '../services/emailService.js'

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
        name: user.name,
        language: user.language,
        currency: user.currency
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
        name: user.name,
        language: user.language,
        currency: user.currency
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    next(error)
  }
}

// @desc    Solicitar reset de password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      })
    }

    const user = await User.findOne({ email })

    // Responder siempre OK para evitar enumeración
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'Si el email existe, enviaremos un enlace para restablecer la contraseña.'
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    await user.save()

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl
    })

    res.status(200).json({
      success: true,
      message:
        'Si el email existe, enviaremos un enlace para restablecer la contraseña.'
    })
  } catch (error) {
    console.error('ForgotPassword error:', error)
    next(error)
  }
}

// @desc    Resetear password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    }).select('+password')

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      })
    }

    user.password = newPassword
    user.passwordResetToken = ''
    user.passwordResetExpires = new Date(0)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    console.error('ResetPassword error:', error)
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
        language: user.language,
        currency: user.currency,
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
    const { name, email, language, currency } = req.body

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
    if (language && (language === 'es' || language === 'en')) {
      user.language = language
    }
    if (currency && (currency === 'EUR' || currency === 'USD')) {
      user.currency = currency
    }

    await user.save()

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        language: user.language,
        currency: user.currency
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
