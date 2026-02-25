import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../src/app.js'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

describe('GET /', () => {
  it('returns 200 with health check message', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Task Manager API is running')
  })
})

describe('Auth Middleware', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized, no token!')
  })

  it('returns 401 when Authorization header has no Bearer prefix', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'notabearer token123')
    expect(res.status).toBe(401)
  })

  it('returns 401 when token has an invalid signature', async () => {
    const fakeToken = jwt.sign({ id: 'fakeid' }, 'wrong-secret', { expiresIn: '1d' })
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${fakeToken}`)
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized, token failed!')
  })

  it('returns 401 when token is expired', async () => {
    const expiredToken = jwt.sign({ id: 'someid' }, JWT_SECRET, { expiresIn: -1 })
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${expiredToken}`)
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Not authorized, token failed!')
  })

  it('returns 401 when Authorization header is "Bearer " with no token after the space', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer ')
    expect(res.status).toBe(401)
  })

  it('allows request through with a valid token (returns 200, not 401)', async () => {
    // Register a user to get a valid token
    const reg = await request(app)
      .post('/api/users/register')
      .send({ name: 'Auth User', email: 'auth@test.com', password: 'password123' })
    const { token } = reg.body

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})
