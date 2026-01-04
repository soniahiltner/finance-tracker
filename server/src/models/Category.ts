import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  isDefault: boolean
  userId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      },
      required: [true, 'Category type is required']
    },
    icon: {
      type: String,
      default: 'circle'
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Solo requerido si no es categoría default
      required: function (this: ICategory) {
        return !this.isDefault
      }
    }
  },
  {
    timestamps: true
  }
)


// Index compuesto para búsquedas eficientes
categorySchema.index({ userId: 1, type: 1 })
categorySchema.index({ isDefault: 1, type: 1 })

export const Category = mongoose.model<ICategory>('Category', categorySchema)
