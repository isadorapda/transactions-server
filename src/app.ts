import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie) // register cookie plugin before the routes plugin, bc we need to save the user's info before the transactions routes

// register routes puglin
app.register(transactionsRoutes, {
  prefix: 'transactions', // this allows to use the same prefix to all routes
})

// ther order that we register plugins matters, bc fastify will load pluging in the order they are declared.
// It will only load the next plugin when the current one has been loaded.
