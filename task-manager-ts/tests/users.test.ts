import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/userModel.js'

const testUser = { name: 'Test User', email: 'test@example.com', password: 'password123' }

async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/users/register')
    .send({ ...testUser, ...overrides })
}

async function loginUser(email = testUser.email, password = testUser.password) {
  return request(app).post('/api/users/login').send({ email, password })
}

describe('POST /api/users/register', () => {
  it('registers a new user and returns 201 with expected fields', async () => {
    const res = await registerUser()
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      message: 'User registered successfully!',
    })
    expect(res.body._id).toBeDefined()
    expect(res.body.token).toBeDefined()
  })

  it('returns a JWT token in the response', async () => {
    const res = await registerUser()
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
  })

  it('does not return the password in the response', async () => {
    const res = await registerUser()
    expect(res.body.password).toBeUndefined()
  })

  it('returns 400 if email is already registered', async () => {
    await registerUser()
    const res = await registerUser()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('User already exists!')
  })

  it('returns 500 if name is missing', async () => {
    const res = await registerUser({ name: undefined })
    expect(res.status).toBe(500)
  })

  it('returns 500 if email is missing', async () => {
    const res = await registerUser({ email: undefined })
    expect(res.status).toBe(500)
  })

  it('returns 500 if password is missing', async () => {
    const res = await registerUser({ password: undefined })
    expect(res.status).toBe(500)
  })
})

describe('POST /api/users/login', () => {
  it('logs in with valid credentials and returns 200 with token', async () => {
    await registerUser()
    const res = await loginUser()
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ name: testUser.name, email: testUser.email })
    expect(res.body._id).toBeDefined()
    expect(res.body.token).toBeDefined()
  })

  it('returns 401 if email is not registered', async () => {
    const res = await loginUser('nobody@example.com', 'password123')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password!')
  })

  it('returns 401 if password is wrong', async () => {
    await registerUser()
    const res = await loginUser(testUser.email, 'wrongpassword')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password!')
  })
})

describe('PUT /api/users/profile', () => {
  async function getToken() {
    await registerUser()
    const login = await loginUser()
    return login.body.token as string
  }

  it('updates the user name', async () => {
    const token = await getToken()
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Name')
  })

  it('updates the password and new password works for login', async () => {
    const token = await getToken()
    await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newpassword456' })

    const login = await loginUser(testUser.email, 'newpassword456')
    expect(login.status).toBe(200)
  })

  it('does not change the email', async () => {
    const token = await getToken()
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Renamed' })
    expect(res.body.email).toBe(testUser.email)
  })

  it('returns 401 with no token', async () => {
    const res = await request(app).put('/api/users/profile').send({ name: 'Hacker' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized, no token!')
  })

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ name: 'Hacker' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized, token failed!')
  })
})

describe('Controller catch blocks', () => {
  it('POST /api/users/login returns 500 when User.findOne throws', async () => {
    vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB error'))
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'any@example.com', password: 'password' })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server error!')
    vi.restoreAllMocks()
  })

  it('PUT /api/users/profile returns 404 when user no longer exists', async () => {
    await request(app).post('/api/users/register').send(testUser)
    const login = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password })
    const { token } = login.body

    // Middleware calls findById (call 1) — must succeed so req.user is set.
    // Controller calls findById (call 2) — return null to simulate user deleted after auth.
    const original = User.findById.bind(User)
    let calls = 0
    vi.spyOn(User, 'findById').mockImplementation((id: any) => {
      calls++
      if (calls === 2) return null as any
      return original(id)
    })

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('User not found')
    vi.restoreAllMocks()
  })

  it('PUT /api/users/profile returns 500 when user.save() throws', async () => {
    await request(app).post('/api/users/register').send(testUser)
    const login = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password })
    const { token } = login.body

    vi.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('DB error'))
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Crash' })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server error: Profile update failed')
    vi.restoreAllMocks()
  })
})
