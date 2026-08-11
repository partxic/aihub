import { Hono } from 'hono'
const api = new Hono()

api.use(async (c, next) => {
    let host = c.req.header('x-forwarded-host')
    if (typeof host !== 'string') host = c.req.header('host')
    else host = host.split(',')[0].trim()
    c.set('host', host)
    return await next()
})

api.use(async (c, next) => {
    if (typeof c.env.jwt_secret !== 'string' || c.env.jwt_secret === '') return c.text('加密密钥配置错误', 500)
    if (typeof c.env.db === 'undefined') return c.text('数据库未绑定', 500)
    return await next()
})

import { connect } from './db.js'
api.use(async (c, next) => {
    connect(c.env.db)
    return await next()
})

api.get('/status', c => {
    return c.text('后端正常', 200)
})

import auth from './auth.js'
api.route('/auth', auth)

import account from './account.js'
api.route('/account', account)

import user from './user.js'
api.route('/user', user)

export default api
