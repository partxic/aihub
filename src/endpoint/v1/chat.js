import { Hono } from 'hono'
const chat = new Hono()

import common from './common.js'
chat.post('/completions', common)

export default chat
