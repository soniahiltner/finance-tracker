import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      },
      required: [true, 'Transaction type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      validate: {
        validator: function (value: number) {
          // Validar máximo 2 decimales
          return /^\d+(\.\d{1,2})?$/.test(value.toString())
        },
        message: 'Amount cannot have more than 2 decimal places'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Indices para queries eficientes
transactionSchema.index({ userId: 1, date: -1 })
transactionSchema.index({ userId: 1, type: 1, date: -1 })
transactionSchema.index({ userId: 1, category: 1 })

// Virtual para obtener el mes/año (útil para agregaciones)
transactionSchema.virtual('monthYear').get(function () {
  const date = this.date
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
})

export const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
)