import { Hono } from 'hono'
const auth = new Hono()

import db from './db.js'
import crypto from 'crypto'

import { decode, sign, verify } from 'hono/jwt'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

auth.post('/login', async c => {
    const { username, password } = await c.req.json()
    if (typeof username !== 'string' || username === '' || typeof password !== 'string' || password === '') {
        return c.text('请求错误', 400)
    }

    const user = await db().query.users.findFirst({
        where: (users, { eq }) => eq(users.name, username)
    })

    if (typeof user === 'undefined') {
        return c.text('用户不存在', 404)
    }

    const pwdHash = crypto.createHash('sha256').update(password).digest('hex')
    if (pwdHash !== user.pwdHash) {
        return c.text('密码错误', 403)
    }

    const token = await sign(
        {
            ...user,
            exp: Math.floor(Date.now() / 1000) + 5 * 60
        },
        c.env.jwt_secret,
        'HS256'
    )

    setCookie(c, 'user', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60
    })

    return c.text('登录成功', 200)
})

export const needAuth = async (c, next) => {
    const token = getCookie(c, 'user')
    if (typeof token === 'undefined') {
        return c.text('未授权', 401)
    }

    try {
        const user = await verify(token, c.env.jwt_secret, 'HS256')
        c.set('user', user)
    } catch {
        try {
            const { payload } = decode(token)
            const user = await db().query.users.findFirst({
                where: (users, { eq }) => eq(users.name, payload.name)
            })

            if (typeof user === 'undefined') {
                return c.text('用户不存在', 404)
            }

            if (payload.pwdHash !== user.pwdHash) {
                return c.text('密码错误', 403)
            }

            const newToken = await sign(
                {
                    ...user,
                    exp: Math.floor(Date.now() / 1000) + 5 * 60
                },
                c.env.jwt_secret,
                'HS256'
            )

            setCookie(c, 'user', newToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60
            })

            c.set('user', user)
        } catch {
            return c.text('验证失败', 401)
        }
    }

    return await next()
}

auth.get('/status', needAuth, c => {
    return c.text('验证成功', 200)
})

auth.get('/logout', needAuth, c => {
    deleteCookie(c, 'user')
    return c.text('已登出', 200)
})

export default auth
