import mongoose, { Document, Schema } from 'mongoose'

export interface ISavingsGoal extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  category: string
  color: string
  icon: string
  isCompleted: boolean
  completedAt?: Date | undefined
  createdAt: Date
  updatedAt: Date
}

const savingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than 0']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative']
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
    },
    icon: {
      type: String,
      default: 'target'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Índices
savingsGoalSchema.index({ userId: 1, isCompleted: 1 })

// Virtual para calcular porcentaje
savingsGoalSchema.virtual('progress').get(function () {
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100)
})

// Virtual para calcular días restantes
savingsGoalSchema.virtual('daysRemaining').get(function () {
  const now = new Date()
  const deadline = new Date(this.deadline)
  const diff = deadline.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// Middleware para marcar como completado
savingsGoalSchema.pre(
  'save',
  async function () {
    if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
      this.isCompleted = true
      this.completedAt = new Date()
    } else if (this.currentAmount < this.targetAmount && this.isCompleted) {
      this.isCompleted = false
      this.completedAt = undefined
    }
  }
)

export const SavingsGoal = mongoose.model<ISavingsGoal>(
  'SavingsGoal',
  savingsGoalSchema
)
