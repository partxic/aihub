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

import common from './v1/common.js'
v1.post('/responses', common)
v1.post('/embeddings', common)
v1.post('/rerank', common)

import audio from './v1/audio.js'
v1.route('/audio', audio)

import images from './v1/images.js'
v1.route('/images', images)

export default v1
