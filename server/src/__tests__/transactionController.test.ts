import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User, Transaction, Category } from '../models/index.js'
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary
} from '../controllers/transactionController.js'
import { protect } from '../middleware/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validate.js'
import {
  createTransactionSchema,
  updateTransactionSchema
} from '../validation/schemas.js'
import { generateToken } from '../utils/generateToken.js'

let app: Express
let mongoServer: MongoMemoryServer
let authToken: string
let userId: string
let categoryId: string

// Setup test app
const setupApp = (): Express => {
  const testApp = express()
  testApp.use(express.json())

  // Definir rutas directamente
  testApp.get('/api/transactions/summary', protect, getTransactionsSummary)
  testApp.get('/api/transactions', protect, getTransactions)
  testApp.get('/api/transactions/:id', protect, getTransaction)
  testApp.post(
    '/api/transactions',
    protect,
    validate(createTransactionSchema),
    createTransaction
  )
  testApp.put(
    '/api/transactions/:id',
    protect,
    validate(updateTransactionSchema),
    updateTransaction
  )
  testApp.delete('/api/transactions/:id', protect, deleteTransaction)

  testApp.use(errorHandler)
  return testApp
}

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'

  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  await mongoose.connect(mongoUri)

  app = setupApp()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
  await Transaction.deleteMany({})
  await Category.deleteMany({})

  // Crear usuario y token
  const user = await User.create({
    email: 'transaction@test.com',
    password: 'Password123!',
    name: 'Transaction Test'
  })

  userId = user._id.toString()
  authToken = generateToken(userId)

  // Crear categoría
  const category = await Category.create({
    name: 'Food',
    type: 'expense',
    icon: 'utensils',
    color: '#f59e0b',
    isDefault: true
  })

  categoryId = category._id.toString()
})

describe('Transaction Controller - GET /api/transactions', () => {
  it('should get all user transactions', async () => {
    // Crear transacciones
    await Transaction.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 50,
        category: categoryId,
        description: 'Groceries',
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'income',
        amount: 1000,
        category: categoryId,
        description: 'Salary',
        date: new Date()
      }
    ])

    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.count).toBe(2)
    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('should filter transactions by type', async () => {
    await Transaction.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 50,
        category: categoryId,
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'income',
        amount: 1000,
        category: categoryId,
        date: new Date()
      }
    ])

    const response = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.count).toBe(1)
    expect(response.body.data[0].type).toBe('income')
  })

  it('should filter transactions by category', async () => {
    const otherCategory = await Category.create({
      name: 'Transport',
      type: 'expense',
      icon: 'car',
      color: '#3b82f6',
      isDefault: true
    })

    await Transaction.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 50,
        category: categoryId,
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 30,
        category: otherCategory._id.toString(),
        date: new Date()
      }
    ])

    const response = await request(app)
      .get(`/api/transactions?category=${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(1)
    expect(response.body.data[0].category).toBe(categoryId)
  })

  it('should filter transactions by month and year', async () => {
    const currentDate = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    await Transaction.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 50,
        category: categoryId,
        date: currentDate
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 30,
        category: categoryId,
        date: lastMonth
      }
    ])

    const response = await request(app)
      .get(
        `/api/transactions?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
      )
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(1)
  })

  it('should not show other users transactions', async () => {
    const otherUserId = new mongoose.Types.ObjectId()

    await Transaction.create({
      userId: otherUserId,
      type: 'expense',
      amount: 999,
      category: categoryId,
      description: 'Other user transaction',
      date: new Date()
    })

    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(0)
  })
})

describe('Transaction Controller - GET /api/transactions/:id', () => {
  it('should get a transaction by id', async () => {
    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense',
      amount: 75.5,
      category: categoryId,
      description: 'Restaurant',
      date: new Date()
    })

    const response = await request(app)
      .get(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.amount).toBe(75.5)
    expect(response.body.data.description).toBe('Restaurant')
  })

  it('should return 404 for non-existent transaction', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .get(`/api/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('not found')
  })

  it('should return 403 for other users transaction', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherTransaction = await Transaction.create({
      userId: otherUserId,
      type: 'expense',
      amount: 100,
      category: categoryId,
      date: new Date()
    })

    const response = await request(app)
      .get(`/api/transactions/${otherTransaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Not authorized')
  })
})

describe('Transaction Controller - POST /api/transactions', () => {
  it('should create a transaction successfully', async () => {
    const newTransaction = {
      type: 'expense',
      amount: 45.99,
      category: categoryId,
      description: 'Coffee shop',
      date: new Date().toISOString()
    }

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newTransaction)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.type).toBe('expense')
    expect(response.body.data.amount).toBe(45.99)
    expect(response.body.data.description).toBe('Coffee shop')
    expect(response.body.data.userId).toBe(userId)
  })

  it('should create transaction without optional fields', async () => {
    const minimalTransaction = {
      type: 'income',
      amount: 500,
      category: categoryId,
      description: '', // Ahora es requerido por validación
      date: new Date().toISOString()
    }

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(minimalTransaction)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.description).toBe('')
    expect(response.body.data).toHaveProperty('date')
  })

  it('should return 400 if type is missing', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100, category: categoryId })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 if amount is missing', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'expense', category: categoryId })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 if category is missing', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'expense', amount: 100 })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 for invalid type', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'invalid', amount: 100, category: categoryId })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 for negative or zero amount', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'expense', amount: 0, category: categoryId })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })
})

describe('Transaction Controller - PUT /api/transactions/:id', () => {
  let transaction: any

  beforeEach(async () => {
    transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense',
      amount: 50,
      category: categoryId,
      description: 'Original',
      date: new Date()
    })
  })

  it('should update transaction successfully', async () => {
    const updates = {
      amount: 75,
      description: 'Updated description'
    }

    const response = await request(app)
      .put(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.amount).toBe(75)
    expect(response.body.data.description).toBe('Updated description')
  })

  it('should return 400 for invalid amount', async () => {
    const response = await request(app)
      .put(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: -10 })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 403 when updating other users transaction', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherTransaction = await Transaction.create({
      userId: otherUserId,
      type: 'expense',
      amount: 100,
      category: categoryId,
      date: new Date()
    })

    const response = await request(app)
      .put(`/api/transactions/${otherTransaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 200 })
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Not authorized')
  })

  it('should return 404 for non-existent transaction', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .put(`/api/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100 })
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('Transaction Controller - DELETE /api/transactions/:id', () => {
  let transaction: any

  beforeEach(async () => {
    transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'expense',
      amount: 50,
      category: categoryId,
      date: new Date()
    })
  })

  it('should delete transaction successfully', async () => {
    const response = await request(app)
      .delete(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('deleted')

    // Verificar que se eliminó
    const deleted = await Transaction.findById(transaction._id)
    expect(deleted).toBeNull()
  })

  it('should return 403 when deleting other users transaction', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherTransaction = await Transaction.create({
      userId: otherUserId,
      type: 'expense',
      amount: 100,
      category: categoryId,
      date: new Date()
    })

    const response = await request(app)
      .delete(`/api/transactions/${otherTransaction._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
  })

  it('should return 404 for non-existent transaction', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .delete(`/api/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('Transaction Controller - GET /api/transactions/summary', () => {
  beforeEach(async () => {
    // Crear varias transacciones
    await Transaction.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'income',
        amount: 1000,
        category: categoryId,
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 200,
        category: categoryId,
        date: new Date()
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        amount: 150,
        category: categoryId,
        date: new Date()
      }
    ])
  })

  it('should return transaction summary', async () => {
    const response = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.summary).toHaveProperty('totalIncome')
    expect(response.body.summary).toHaveProperty('totalExpenses')
    expect(response.body.summary).toHaveProperty('balance')
    expect(response.body.summary).toHaveProperty('byCategory')
    expect(response.body.summary).toHaveProperty('byMonth')
  })

  it('should calculate correct totals', async () => {
    const response = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.summary.totalIncome).toBe(1000)
    expect(response.body.summary.totalExpenses).toBe(350)
    expect(response.body.summary.balance).toBe(650)
  })

  it('should group transactions by category', async () => {
    const response = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.summary.byCategory).toBeInstanceOf(Array)
    expect(response.body.summary.byCategory.length).toBeGreaterThan(0)
  })

  it('should filter summary by month and year', async () => {
    const currentDate = new Date()

    const response = await request(app)
      .get(
        `/api/transactions/summary?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
      )
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.summary.totalIncome).toBe(1000)
  })
})
