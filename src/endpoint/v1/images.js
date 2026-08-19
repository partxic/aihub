import { Hono } from 'hono'
const images = new Hono()

import common from './common.js'
images.post('/generations', common('images/generations'))

export default images
