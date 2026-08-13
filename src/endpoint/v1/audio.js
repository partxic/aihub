import { Hono } from 'hono'
const audio = new Hono()

import common from './common.js'
audio.post('/speech', common)

export default audio
