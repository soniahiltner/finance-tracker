import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User, SavingsGoal } from '../models/index.js'
import {
  getSavingsGoals,
  getSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addProgress,
  getGoalsStats
} from '../controllers/savingsGoalController.js'
import { protect } from '../middleware/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validate.js'
import {
  createSavingsGoalSchema,
  updateSavingsGoalSchema,
  addProgressSchema
} from '../validation/schemas.js'
import { generateToken } from '../utils/generateToken.js'

let app: Express
let mongoServer: MongoMemoryServer
let authToken: string
let userId: string

// Setup test app
const setupApp = (): Express => {
  const testApp = express()
  testApp.use(express.json())

  // Definir rutas directamente
  testApp.get('/api/savings-goals/stats', protect, getGoalsStats)
  testApp.get('/api/savings-goals', protect, getSavingsGoals)
  testApp.get('/api/savings-goals/:id', protect, getSavingsGoal)
  testApp.post(
    '/api/savings-goals',
    protect,
    validate(createSavingsGoalSchema),
    createSavingsGoal
  )
  testApp.put(
    '/api/savings-goals/:id',
    protect,
    validate(updateSavingsGoalSchema),
    updateSavingsGoal
  )
  testApp.delete('/api/savings-goals/:id', protect, deleteSavingsGoal)
  testApp.post(
    '/api/savings-goals/:id/progress',
    protect,
    validate(addProgressSchema),
    addProgress
  )

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
  await SavingsGoal.deleteMany({})

  // Crear usuario y token
  const user = await User.create({
    email: 'savings@test.com',
    password: 'Password123!',
    name: 'Savings Test'
  })

  userId = user._id.toString()
  authToken = generateToken(userId)
})

describe('SavingsGoal Controller - GET /api/savings-goals', () => {
  it('should get all user savings goals', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    await SavingsGoal.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Vacation',
        targetAmount: 2000,
        currentAmount: 500,
        deadline: futureDate,
        category: 'travel',
        color: '#3b82f6',
        icon: 'plane'
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Emergency Fund',
        targetAmount: 5000,
        currentAmount: 5000,
        deadline: futureDate,
        category: 'emergency',
        color: '#ef4444',
        icon: 'shield',
        isCompleted: true
      }
    ])

    const response = await request(app)
      .get('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.count).toBe(2)
    expect(response.body.data).toBeInstanceOf(Array)
    expect(response.body.data[0]).toHaveProperty('progress')
    expect(response.body.data[0]).toHaveProperty('daysRemaining')
  })

  it('should filter active goals', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    await SavingsGoal.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Active Goal',
        targetAmount: 1000,
        currentAmount: 200,
        deadline: futureDate,
        category: 'savings',
        isCompleted: false
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Completed Goal',
        targetAmount: 500,
        currentAmount: 500,
        deadline: futureDate,
        category: 'savings',
        isCompleted: true
      }
    ])

    const response = await request(app)
      .get('/api/savings-goals?status=active')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(1)
    expect(response.body.data[0].isCompleted).toBe(false)
  })

  it('should filter completed goals', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    await SavingsGoal.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Active Goal',
        targetAmount: 1000,
        currentAmount: 200,
        deadline: futureDate,
        category: 'savings',
        isCompleted: false
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Completed Goal',
        targetAmount: 500,
        currentAmount: 500,
        deadline: futureDate,
        category: 'savings',
        isCompleted: true
      }
    ])

    const response = await request(app)
      .get('/api/savings-goals?status=completed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(1)
    expect(response.body.data[0].isCompleted).toBe(true)
  })

  it('should not show other users goals', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    await SavingsGoal.create({
      userId: otherUserId,
      name: 'Other User Goal',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })

    const response = await request(app)
      .get('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.count).toBe(0)
  })
})

describe('SavingsGoal Controller - GET /api/savings-goals/:id', () => {
  it('should get a savings goal by id', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const goal = await SavingsGoal.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'New Car',
      targetAmount: 15000,
      currentAmount: 3000,
      deadline: futureDate,
      category: 'vehicle',
      color: '#10b981',
      icon: 'car'
    })

    const response = await request(app)
      .get(`/api/savings-goals/${goal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('New Car')
    expect(response.body.data.targetAmount).toBe(15000)
  })

  it('should return 404 for non-existent goal', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .get(`/api/savings-goals/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('not found')
  })

  it('should return 403 for other users goal', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const otherGoal = await SavingsGoal.create({
      userId: otherUserId,
      name: 'Other Goal',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })

    const response = await request(app)
      .get(`/api/savings-goals/${otherGoal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Not authorized')
  })
})

describe('SavingsGoal Controller - POST /api/savings-goals', () => {
  it('should create a savings goal successfully', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 12)

    const newGoal = {
      name: 'House Down Payment',
      targetAmount: 50000,
      currentAmount: 10000,
      deadline: futureDate.toISOString(),
      category: 'housing',
      color: '#8b5cf6',
      icon: 'home'
    }

    const response = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newGoal)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('House Down Payment')
    expect(response.body.data.targetAmount).toBe(50000)
    expect(response.body.data.currentAmount).toBe(10000)
    expect(response.body.data.userId).toBe(userId)
  })

  it('should create goal with default values', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const minimalGoal = {
      name: 'Minimal Goal',
      targetAmount: 1000,
      deadline: futureDate.toISOString(),
      category: 'other'
    }

    const response = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send(minimalGoal)
      .expect(201)

    expect(response.body.data.currentAmount).toBe(0)
    expect(response.body.data.color).toBe('#3b82f6')
    expect(response.body.data.icon).toBe('target')
  })

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Incomplete' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 for zero or negative target amount', async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const response = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Invalid',
        targetAmount: 0,
        deadline: futureDate.toISOString(),
        category: 'savings'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 for past deadline', async () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1)

    const response = await request(app)
      .post('/api/savings-goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Past Goal',
        targetAmount: 1000,
        deadline: pastDate.toISOString(),
        category: 'savings'
      })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('future')
  })
})

describe('SavingsGoal Controller - PUT /api/savings-goals/:id', () => {
  let goal: any

  beforeEach(async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    goal = await SavingsGoal.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'Original Goal',
      targetAmount: 2000,
      currentAmount: 500,
      deadline: futureDate,
      category: 'savings'
    })
  })

  it('should update savings goal successfully', async () => {
    const updates = {
      name: 'Updated Goal',
      targetAmount: 3000,
      color: '#f59e0b'
    }

    const response = await request(app)
      .put(`/api/savings-goals/${goal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Updated Goal')
    expect(response.body.data.targetAmount).toBe(3000)
    expect(response.body.data.color).toBe('#f59e0b')
  })

  it('should return 400 for past deadline on active goal', async () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 1)

    const response = await request(app)
      .put(`/api/savings-goals/${goal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ deadline: pastDate.toISOString() })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('future')
  })

  it('should return 403 when updating other users goal', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const otherGoal = await SavingsGoal.create({
      userId: otherUserId,
      name: 'Other Goal',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })

    const response = await request(app)
      .put(`/api/savings-goals/${otherGoal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Hacked' })
      .expect(403)

    expect(response.body.success).toBe(false)
  })

  it('should return 404 for non-existent goal', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .put(`/api/savings-goals/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' })
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('SavingsGoal Controller - POST /api/savings-goals/:id/progress', () => {
  let goal: any

  beforeEach(async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    goal = await SavingsGoal.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'Progress Goal',
      targetAmount: 1000,
      currentAmount: 200,
      deadline: futureDate,
      category: 'savings'
    })
  })

  it('should add progress successfully', async () => {
    const response = await request(app)
      .post(`/api/savings-goals/${goal._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 300 })
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.currentAmount).toBe(500)
    expect(response.body.message).toContain('exitosamente')
  })

  it('should mark goal as completed when target is reached', async () => {
    const response = await request(app)
      .post(`/api/savings-goals/${goal._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 800 })
      .expect(200)

    expect(response.body.data.currentAmount).toBe(1000)
    expect(response.body.message).toContain('completada')
  })

  it('should return 400 for zero or negative amount', async () => {
    const response = await request(app)
      .post(`/api/savings-goals/${goal._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 0 })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 403 for other users goal', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const otherGoal = await SavingsGoal.create({
      userId: otherUserId,
      name: 'Other Goal',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })

    const response = await request(app)
      .post(`/api/savings-goals/${otherGoal._id}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100 })
      .expect(403)

    expect(response.body.success).toBe(false)
  })

  it('should return 404 for non-existent goal', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .post(`/api/savings-goals/${fakeId}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100 })
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('SavingsGoal Controller - DELETE /api/savings-goals/:id', () => {
  let goal: any

  beforeEach(async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    goal = await SavingsGoal.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'To Delete',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })
  })

  it('should delete savings goal successfully', async () => {
    const response = await request(app)
      .delete(`/api/savings-goals/${goal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('deleted')

    // Verificar que se eliminó
    const deleted = await SavingsGoal.findById(goal._id)
    expect(deleted).toBeNull()
  })

  it('should return 403 when deleting other users goal', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    const otherGoal = await SavingsGoal.create({
      userId: otherUserId,
      name: 'Other Goal',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: futureDate,
      category: 'savings'
    })

    const response = await request(app)
      .delete(`/api/savings-goals/${otherGoal._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
  })

  it('should return 404 for non-existent goal', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .delete(`/api/savings-goals/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('SavingsGoal Controller - GET /api/savings-goals/stats', () => {
  beforeEach(async () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6)

    await SavingsGoal.create([
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Goal 1',
        targetAmount: 1000,
        currentAmount: 500,
        deadline: futureDate,
        category: 'savings',
        isCompleted: false
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Goal 2',
        targetAmount: 2000,
        currentAmount: 2000,
        deadline: futureDate,
        category: 'savings',
        isCompleted: true
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        name: 'Goal 3',
        targetAmount: 500,
        currentAmount: 100,
        deadline: futureDate,
        category: 'savings',
        isCompleted: false
      }
    ])
  })

  it('should return goals statistics', async () => {
    const response = await request(app)
      .get('/api/savings-goals/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.stats).toHaveProperty('total')
    expect(response.body.stats).toHaveProperty('active')
    expect(response.body.stats).toHaveProperty('completed')
    expect(response.body.stats).toHaveProperty('totalTarget')
    expect(response.body.stats).toHaveProperty('totalSaved')
    expect(response.body.stats).toHaveProperty('averageProgress')
  })

  it('should calculate correct statistics', async () => {
    const response = await request(app)
      .get('/api/savings-goals/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.stats.total).toBe(3)
    expect(response.body.stats.active).toBe(2)
    expect(response.body.stats.completed).toBe(1)
    expect(response.body.stats.totalTarget).toBe(3500)
    expect(response.body.stats.totalSaved).toBe(2600)
  })
})
