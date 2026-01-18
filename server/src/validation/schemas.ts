import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.email('Email inválido').min(1, 'Email es requerido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Email inválido').min(1, 'Email es requerido'),
    password: z.string().min(1, 'Contraseña es requerida')
  })
})

// Transaction schemas
export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense'], {
      message: 'El tipo debe ser income o expense'
    }),
    amount: z
      .number()
      .positive('El monto debe ser mayor a 0')
      .max(1000000000, 'El monto es demasiado grande'),
    category: z.string().min(1, 'Categoría es requerida'),
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .optional(),
    date: z.iso.datetime({ message: 'Formato de fecha inválido' }).or(z.date())
  })
})

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense']).optional(),
    amount: z
      .number()
      .positive('El monto debe ser mayor a 0')
      .max(1000000000, 'El monto es demasiado grande')
      .optional(),
    category: z.string().min(1, 'Categoría no puede estar vacía').optional(),
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .optional(),
    date: z
      .string()
      .datetime({ message: 'Formato de fecha inválido' })
      .or(z.date())
      .optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de transacción inválido')
  })
})

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de transacción inválido')
  })
})

export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de transacción inválido')
  })
})

export const transactionQuerySchema = z.object({
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'Formato de mes inválido (YYYY-MM)')
      .optional(),
    year: z
      .string()
      .regex(/^\d{4}$/, 'Formato de año inválido')
      .optional(),
    category: z.string().optional(),
    type: z.enum(['income', 'expense']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
})

// Savings Goal schemas
export const createSavingsGoalSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre es demasiado largo'),
    targetAmount: z
      .number()
      .positive('El monto objetivo debe ser mayor a 0')
      .max(1000000000, 'El monto es demasiado grande'),
    currentAmount: z
      .number()
      .min(0, 'El monto actual no puede ser negativo')
      .optional()
      .default(0),
    deadline: z.string().datetime({ message: 'Formato de fecha inválido' }),
    category: z.string().min(1, 'La categoría es requerida'),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
      .optional(),
    icon: z.string().max(50, 'Nombre de ícono demasiado largo').optional()
  })
})

export const updateSavingsGoalSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre no puede estar vacío')
      .max(100, 'El nombre es demasiado largo')
      .optional(),
    targetAmount: z
      .number()
      .positive('El monto objetivo debe ser mayor a 0')
      .max(1000000000, 'El monto es demasiado grande')
      .optional(),
    currentAmount: z
      .number()
      .min(0, 'El monto actual no puede ser negativo')
      .optional(),
    deadline: z
      .string()
      .datetime({ message: 'Formato de fecha inválido' })
      .optional(),
    category: z.string().min(1, 'La categoría no puede estar vacía').optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
      .optional(),
    icon: z.string().max(50, 'Nombre de ícono demasiado largo').optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de meta inválido')
  })
})

export const addProgressSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .positive('El monto debe ser mayor a 0')
      .max(1000000000, 'El monto es demasiado grande')
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de meta inválido')
  })
})

export const deleteSavingsGoalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de meta inválido')
  })
})

// AI Chat schema
export const aiChatSchema = z.object({
  body: z.object({
    message: z
      .string()
      .min(1, 'El mensaje no puede estar vacío')
      .max(2000, 'El mensaje es demasiado largo')
  })
})

// Category schemas
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(50, 'El nombre es demasiado largo'),
    type: z.enum(['income', 'expense'], {
      message: 'El tipo debe ser income o expense'
    }),
    icon: z.string().max(50, 'Nombre de ícono demasiado largo').optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
      .optional()
  })
})

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'El nombre no puede estar vacío')
      .max(50, 'El nombre es demasiado largo')
      .optional(),
    icon: z.string().max(50, 'Nombre de ícono demasiado largo').optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
      .optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de categoría inválido')
  })
})

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de categoría inválido')
  })
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
      .optional(),
    email: z.email('Email inválido').optional()
  })
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
      .max(100, 'La nueva contraseña es demasiado larga')
  })
})
