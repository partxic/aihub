import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
    name: text('name').primaryKey().notNull(),
    pwdHash: text('pwd_hash').notNull(),
    isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false)
})

export const providers = sqliteTable('providers', {
    name: text('name').primaryKey().notNull(),
    baseUrl: text('base_url').notNull(),
    apiKey: text('api_key').notNull()
})

export const unimodels = sqliteTable('unimodels', {
    name: text('name').primaryKey().notNull(),
    models: text('models', { mode: 'json' }).notNull()
})

export const mcps = sqliteTable('mcps', {
    name: text('name').primaryKey().notNull(),
    url: text('url').notNull(),
    httpHeader: text('http_header', { mode: 'json' }).notNull()
})

import { drizzle } from 'drizzle-orm/d1'
let dbconn = null
export const connect = conn => (dbconn = conn)
export default () => drizzle(dbconn, { schema: { users, providers, unimodels, mcps } })
