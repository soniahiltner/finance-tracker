import request from 'supertest'
import express, { type Express } from 'express'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User, Category } from '../models/index.js'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js'
import { protect } from '../middleware/auth.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { validate } from '../middleware/validate.js'
import {
  createCategorySchema,
  updateCategorySchema
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
  testApp.get('/api/categories', protect, getCategories)
  testApp.get('/api/categories/:id', protect, getCategory)
  testApp.post(
    '/api/categories',
    protect,
    validate(createCategorySchema),
    createCategory
  )
  testApp.put(
    '/api/categories/:id',
    protect,
    validate(updateCategorySchema),
    updateCategory
  )
  testApp.delete('/api/categories/:id', protect, deleteCategory)

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
  await Category.deleteMany({})

  // Crear usuario y token
  const user = await User.create({
    email: 'category@test.com',
    password: 'Password123!',
    name: 'Category Test'
  })

  userId = user._id.toString()
  authToken = generateToken(userId)

  // Crear categorías default
  await Category.create([
    {
      name: 'Salary',
      type: 'income',
      icon: 'wallet',
      color: '#10b981',
      isDefault: true
    },
    {
      name: 'Food',
      type: 'expense',
      icon: 'utensils',
      color: '#f59e0b',
      isDefault: true
    },
    {
      name: 'Transport',
      type: 'expense',
      icon: 'car',
      color: '#3b82f6',
      isDefault: true
    }
  ])
})

describe('Category Controller - GET /api/categories', () => {
  it('should get all categories (default + user custom)', async () => {
    // Crear categoría custom
    await Category.create({
      name: 'Freelance',
      type: 'income',
      icon: 'briefcase',
      color: '#8b5cf6',
      isDefault: false,
      userId: new mongoose.Types.ObjectId(userId)
    })

    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.count).toBe(4) // 3 default + 1 custom
    expect(response.body.data).toBeInstanceOf(Array)
  })

  it('should filter categories by type', async () => {
    const response = await request(app)
      .get('/api/categories?type=income')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.every((cat: any) => cat.type === 'income')).toBe(
      true
    )
  })

  it('should return 401 without authentication', async () => {
    const response = await request(app).get('/api/categories').expect(401)

    expect(response.body.success).toBe(false)
  })

  it('should not show other users custom categories', async () => {
    const otherUserId = new mongoose.Types.ObjectId()

    await Category.create({
      name: 'Other User Category',
      type: 'expense',
      icon: 'star',
      color: '#ef4444',
      isDefault: false,
      userId: otherUserId
    })

    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(
      response.body.data.find((cat: any) => cat.name === 'Other User Category')
    ).toBeUndefined()
  })
})

describe('Category Controller - GET /api/categories/:id', () => {
  it('should get a default category by id', async () => {
    const category = await Category.findOne({ name: 'Food' })

    const response = await request(app)
      .get(`/api/categories/${category!._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Food')
  })

  it('should get own custom category by id', async () => {
    const customCategory = await Category.create({
      name: 'Custom Category',
      type: 'expense',
      icon: 'star',
      color: '#ec4899',
      isDefault: false,
      userId: new mongoose.Types.ObjectId(userId)
    })

    const response = await request(app)
      .get(`/api/categories/${customCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Custom Category')
  })

  it('should return 404 for non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .get(`/api/categories/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('not found')
  })

  it('should return 403 for other users custom category', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherCategory = await Category.create({
      name: 'Other User Category',
      type: 'expense',
      icon: 'star',
      color: '#ef4444',
      isDefault: false,
      userId: otherUserId
    })

    const response = await request(app)
      .get(`/api/categories/${otherCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Not authorized')
  })
})

describe('Category Controller - POST /api/categories', () => {
  it('should create a custom category successfully', async () => {
    const newCategory = {
      name: 'Investment',
      type: 'income',
      icon: 'chart',
      color: '#14b8a6'
    }

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newCategory)
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Investment')
    expect(response.body.data.type).toBe('income')
    expect(response.body.data.isDefault).toBe(false)
    expect(response.body.data.userId).toBe(userId)
  })

  it('should return 400 if name is missing', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ type: 'income' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 if type is missing', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' })
      .expect(400)

    expect(response.body.success).toBe(false)
  })

  it('should return 400 for invalid type', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test', type: 'invalid' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('validación')
  })

  it('should return 400 if category name already exists', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Food', type: 'expense' }) // Ya existe default
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('already exists')
  })

  it('should use default values for icon and color', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Minimal', type: 'expense' })
      .expect(201)

    expect(response.body.data.icon).toBe('circle')
    expect(response.body.data.color).toBe('#6366f1')
  })
})

describe('Category Controller - PUT /api/categories/:id', () => {
  let customCategory: any

  beforeEach(async () => {
    customCategory = await Category.create({
      name: 'My Category',
      type: 'expense',
      icon: 'star',
      color: '#ec4899',
      isDefault: false,
      userId: new mongoose.Types.ObjectId(userId)
    })
  })

  it('should update custom category successfully', async () => {
    const updates = {
      name: 'Updated Category',
      icon: 'heart',
      color: '#f97316'
    }

    const response = await request(app)
      .put(`/api/categories/${customCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Updated Category')
    expect(response.body.data.icon).toBe('heart')
    expect(response.body.data.color).toBe('#f97316')
  })

  it('should return 403 when trying to update default category', async () => {
    const defaultCategory = await Category.findOne({ isDefault: true })

    const response = await request(app)
      .put(`/api/categories/${defaultCategory!._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'New Name' })
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('default categories')
  })

  it('should return 403 when updating other users category', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherCategory = await Category.create({
      name: 'Other Category',
      type: 'expense',
      icon: 'star',
      color: '#ef4444',
      isDefault: false,
      userId: otherUserId
    })

    const response = await request(app)
      .put(`/api/categories/${otherCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Hacked' })
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('Not authorized')
  })

  it('should return 404 for non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .put(`/api/categories/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' })
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})

describe('Category Controller - DELETE /api/categories/:id', () => {
  let customCategory: any

  beforeEach(async () => {
    customCategory = await Category.create({
      name: 'To Delete',
      type: 'expense',
      icon: 'trash',
      color: '#ef4444',
      isDefault: false,
      userId: new mongoose.Types.ObjectId(userId)
    })
  })

  it('should delete custom category successfully', async () => {
    const response = await request(app)
      .delete(`/api/categories/${customCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.message).toContain('deleted')

    // Verificar que se eliminó
    const deleted = await Category.findById(customCategory._id)
    expect(deleted).toBeNull()
  })

  it('should return 403 when trying to delete default category', async () => {
    const defaultCategory = await Category.findOne({ isDefault: true })

    const response = await request(app)
      .delete(`/api/categories/${defaultCategory!._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
    expect(response.body.message).toContain('default categories')
  })

  it('should return 403 when deleting other users category', async () => {
    const otherUserId = new mongoose.Types.ObjectId()
    const otherCategory = await Category.create({
      name: 'Other Category',
      type: 'expense',
      icon: 'star',
      color: '#ef4444',
      isDefault: false,
      userId: otherUserId
    })

    const response = await request(app)
      .delete(`/api/categories/${otherCategory._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)

    expect(response.body.success).toBe(false)
  })

  it('should return 404 for non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .delete(`/api/categories/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)

    expect(response.body.success).toBe(false)
  })
})
