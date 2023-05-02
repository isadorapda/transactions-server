// eslint-disable-next-line
import { Knex } from 'knex'

// we're overwriting types

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}