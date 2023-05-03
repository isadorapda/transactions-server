import { test, beforeAll, afterAll, describe } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    // we are using this here because of the fact that fastify plugins are all asynchronous, so we need to wait the server to start and then test it.
    // without this the test fails because it doesn't find the routes.
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  test('user should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test transaction 01',
        amount: 500,
        type: 'credit',
      })
      .expect(201)
  })
})
