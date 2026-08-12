import { Hono } from 'hono'
const user = new Hono()

import { cookieName, hashAlg, needAuth, needPermission } from './auth.js'
user.use(needAuth)
user.use(needPermission)

import { users } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

import crypto from 'crypto'

user.get('/list', async c => {
    const result = await db()
        .select({
            name: users.name,
            isAdmin: users.isAdmin
        })
        .from(users)

    return c.json(result, 200)
})

user.get('/info', async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db().query.users.findFirst({
        columns: { name: true, isAdmin: true },
        where: (users, { eq }) => eq(users.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('用户不存在', 404)
    }

    return c.json(result, 200)
})

user.delete('/delete', async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const reqUser = c.get(cookieName)
    if (name === reqUser.name) {
        return c.text('请求错误', 400)
    }

    await db().delete(users).where(eq(users.name, name))
    return c.text('删除成功', 200)
})

user.post('/save', async c => {
    const { name, password, isAdmin } = await c.req.json()
    if (typeof name !== 'string' || name === '' || typeof password !== 'string' || typeof isAdmin !== 'boolean') {
        return c.text('请求错误', 400)
    }

    const reqUser = c.get(cookieName)
    if (name === reqUser.name) {
        return c.text('请求错误', 400)
    }

    const oldUser = await db().query.users.findFirst({
        columns: { name: true },
        where: (users, { eq }) => eq(users.name, name)
    })

    if (typeof oldUser === 'undefined') {
        if (password === '') {
            return c.text('请求错误', 400)
        }

        const pwdHash = crypto.createHash(hashAlg).update(password).digest('hex')
        await db().insert(users).values({ name, pwdHash, isAdmin })
    } else {
        const pwdHash = password === '' ? undefined : crypto.createHash(hashAlg).update(password).digest('hex')
        await db().update(users).set({ name, pwdHash, isAdmin }).where(eq(users.name, name))
    }

    return c.text('保存成功', 200)
})

export default user
