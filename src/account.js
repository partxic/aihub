import { Hono } from 'hono'
const account = new Hono()

import { cookieName, hashAlg, needAuth } from './auth.js'
account.use(needAuth)

import crypto from 'crypto'
import { encrypt } from './aes256gcm.js'

import { users } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

import { deleteCookie } from 'hono/cookie'

account.post('/reset-password', async c => {
    const { password } = await c.req.json()
    if (typeof password !== 'string' || password === '') {
        return c.text('请求错误', 400)
    }

    const user = c.get(cookieName)
    const pwdHash = crypto.createHash(hashAlg).update(password).digest('hex')
    await db().update(users).set({ pwdHash }).where(eq(users.name, user.name))

    deleteCookie(c, cookieName)
    return c.text('重置成功', 200)
})

account.get('/api-key', c => {
    const user = c.get(cookieName)
    const key = encrypt(user.name + '.' + user.pwdHash)
    return c.text(key, 200)
})

export default account
