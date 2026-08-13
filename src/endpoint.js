import { Hono } from 'hono'
const endpoint = new Hono()

import { cors } from 'hono/cors'
endpoint.use(cors())

import { decrypt } from './aes256gcm.js'
import db from './db.js'
import cache from './cache.js'

endpoint.use(async (c, next) => {
    const authorization = c.req.header('Authorization')
    if (typeof authorization === 'undefined') {
        return c.text('未授权', 401)
    }

    const parts = authorization.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return c.text('验证失败', 403)
    }

    const encryptedToken = parts[1]
    const token = decrypt(encryptedToken)

    const spliterIdx = token.indexOf('.')
    const userName = token.substring(0, spliterIdx)
    const userPwdHash = token.substring(spliterIdx + 1)

    const user = await cache(`user:${userName}`, () =>
        db().query.users.findFirst({
            columns: { name: true, pwdHash: true },
            where: (users, { eq }) => eq(users.name, userName)
        })
    )

    if (typeof user === 'undefined') {
        return c.text('用户不存在', 404)
    }

    if (userPwdHash !== user.pwdHash) {
        return c.text('验证失败', 403)
    }

    c.set('user', user)
    return await next()
})

endpoint.use(async (c, next) => {
    c.req.wait1s = () => new Promise(r => setTimeout(r, 1000))
    return await next()
})

import v1 from './endpoint/v1.js'
endpoint.route('/v1', v1)

import mcp from './endpoint/mcp.js'
endpoint.route('/mcp', mcp)

export default endpoint
