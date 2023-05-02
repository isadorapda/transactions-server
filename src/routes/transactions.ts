import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  // app.get('/hello', async () => {
  //   const transaction = await knex('transactions')
  //     // inserting data in the table
  //     .insert({
  //       id: crypto.randomUUID(),
  //       title: 'Test transaction',
  //       amount: 500,
  //     })
  //     .returning('*') // without this method, it will only return a number, so we use returning('*') to get all contents of the db
  //   return transaction
  // })
  //   app.get('/hello', async () => {
  //     const transaction = await knex('transactions')
  //       .where('amount', 500) // specifying which data to select
  //       .select('*')
  //     return transaction
  //   })
  // app.addHook('preHandler', async (req, res) => {
  //   console.log(`[${req.method}], ${req.url}`)
  // })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const getTransactionParamSchema = z.object({
        // schema declaration
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamSchema.parse(req.params) // data validation
      const { sessionId } = req.cookies
      const transactions = await knex('transactions')
        .where({ id, session_id: sessionId })
        .first() // query with query builder knex
      return { transactions } // returning as an object allows for future increment the data
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const summaryTransactions = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' }) // adding {as: ''} to determine the property name, otherwise it will be 'sum('amount')'
        .first() // without the .first() method, knex will return an array. When we add first() we are saying that we want the first appearance, so it return an obj
      return { summaryTransactions }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const createTransactionBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
      })
      const { title, amount, type } = createTransactionBodySchema.parse(
        req.body,
      ) // validating the data from the request body according to what we specified in the schema

      let sessionId = req.cookies.sessionId

      if (!sessionId) {
        sessionId = crypto.randomUUID()
        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      }

      await knex('transactions').insert({
        id: crypto.randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })
      return reply.status(201).send()
    },
  )
}
