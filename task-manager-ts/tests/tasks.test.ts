import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import Task from '../src/models/taskModel.js'

const userA = { name: 'User A', email: 'usera@example.com', password: 'password123' }
const userB = { name: 'User B', email: 'userb@example.com', password: 'password123' }

async function registerAndLogin(user: typeof userA) {
  await request(app).post('/api/users/register').send(user)
  const res = await request(app).post('/api/users/login').send({ email: user.email, password: user.password })
  return res.body as { token: string; _id: string }
}

async function createTask(token: string, overrides = {}) {
  return request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Task', description: 'A task for testing', ...overrides })
}

describe('GET /api/tasks', () => {
  it('returns an empty array when the user has no tasks', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it("returns only the authenticated user's tasks, not other users'", async () => {
    const a = await registerAndLogin(userA)
    const b = await registerAndLogin(userB)

    await createTask(a.token, { title: 'User A task' })
    await createTask(b.token, { title: 'User B task' })

    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${a.token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('User A task')
  })

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/tasks', () => {
  it('creates a task and returns 201 with expected fields', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await createTask(token)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      title: 'Test Task',
      description: 'A task for testing',
      isCompleted: false,
    })
    expect(res.body._id).toBeDefined()
    expect(res.body.user).toBeDefined()
  })

  it('isCompleted defaults to false', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await createTask(token)
    expect(res.body.isCompleted).toBe(false)
  })

  it("task user field matches the authenticated user's id", async () => {
    const { token, _id } = await registerAndLogin(userA)
    const res = await createTask(token)
    expect(res.body.user).toBe(_id)
  })

  it('returns 400 if title is missing', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await createTask(token, { title: undefined })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid task data')
  })

  it('returns 400 if description is missing', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await createTask(token, { description: undefined })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid task data')
  })

  it('returns 401 with no token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', description: 'Test' })
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/tasks/:id', () => {
  it('updates a task and returns 200 with updated values', async () => {
    const { token } = await registerAndLogin(userA)
    const created = await createTask(token)
    const taskId = created.body._id

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title', description: 'Updated desc', isCompleted: true })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated Title')
    expect(res.body.isCompleted).toBe(true)
  })

  it('can toggle isCompleted to true', async () => {
    const { token } = await registerAndLogin(userA)
    const created = await createTask(token)
    const taskId = created.body._id

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'A task for testing', isCompleted: true })

    expect(res.body.isCompleted).toBe(true)
  })

  it('returns 404 if task does not exist', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await request(app)
      .put('/api/tasks/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X', description: 'Y' })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found!')
  })

  it("returns 401 when trying to update another user's task", async () => {
    const a = await registerAndLogin(userA)
    const b = await registerAndLogin(userB)
    const created = await createTask(a.token)
    const taskId = created.body._id

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${b.token}`)
      .send({ title: 'Stolen', description: 'Stolen desc' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('User not authorized to update this task!')
  })

  it('returns 401 with no token', async () => {
    const res = await request(app)
      .put('/api/tasks/000000000000000000000000')
      .send({ title: 'X', description: 'Y' })
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/tasks/:id', () => {
  it('partially updates a task (toggle isCompleted)', async () => {
    const { token } = await registerAndLogin(userA)
    const created = await createTask(token)
    const taskId = created.body._id

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true })

    expect(res.status).toBe(200)
    expect(res.body.isCompleted).toBe(true)
  })

  it("returns 401 when trying to patch another user's task", async () => {
    const a = await registerAndLogin(userA)
    const b = await registerAndLogin(userB)
    const created = await createTask(a.token)
    const taskId = created.body._id

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${b.token}`)
      .send({ isCompleted: true })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('User not authorized to update this task!')
  })
})

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task and returns 200 with confirmation', async () => {
    const { token } = await registerAndLogin(userA)
    const created = await createTask(token)
    const taskId = created.body._id

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(taskId)
    expect(res.body.message).toBe('Task removed!')
  })

  it('task is gone from subsequent GET after deletion', async () => {
    const { token } = await registerAndLogin(userA)
    const created = await createTask(token)
    const taskId = created.body._id

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`)
    expect(res.body).toHaveLength(0)
  })

  it('returns 404 if task does not exist', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await request(app)
      .delete('/api/tasks/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found!')
  })

  it("returns 401 when trying to delete another user's task", async () => {
    const a = await registerAndLogin(userA)
    const b = await registerAndLogin(userB)
    const created = await createTask(a.token)
    const taskId = created.body._id

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${b.token}`)

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('User not authorized to delete this task!')
  })

  it('returns 401 with no token', async () => {
    const res = await request(app).delete('/api/tasks/000000000000000000000000')
    expect(res.status).toBe(401)
  })
})

describe('Controller catch blocks', () => {
  it('GET /api/tasks returns 500 when Task.find throws', async () => {
    const { token } = await registerAndLogin(userA)
    vi.spyOn(Task, 'find').mockRejectedValueOnce(new Error('DB error'))
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server Error!')
    vi.restoreAllMocks()
  })

  it('PUT /api/tasks/:id returns 500 for a malformed ObjectID (CastError)', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await request(app)
      .put('/api/tasks/not-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X', description: 'Y' })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server error!')
  })

  it('DELETE /api/tasks/:id returns 500 for a malformed ObjectID (CastError)', async () => {
    const { token } = await registerAndLogin(userA)
    const res = await request(app)
      .delete('/api/tasks/not-valid-id')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Server error!')
  })
})
