import { Hono } from 'hono'
const v1 = new Hono()

import { providers } from '../db.js'
import db from '../db.js'

v1.use(async (c, next) => {
    c.set('providers', await db().select().from(providers))
    return await next()
})

import models from './v1/models.js'
v1.route('/models', models)

import chat from './v1/chat.js'
v1.route('/chat', chat)

export default v1
