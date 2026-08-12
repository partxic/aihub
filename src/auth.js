import { Hono } from 'hono'
const auth = new Hono()

import db from './db.js'

import crypto from 'crypto'
import { encrypt, decrypt } from './aes256gcm.js'

import { decode, sign, verify } from 'hono/jwt'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

export const cookieName = 'user'
const jwtExpire = 2 * 60
const cookieExpire = 24 * 60 * 60
const now = () => Math.floor(Date.now() / 1000)
const signAlg = 'HS256'
export const hashAlg = 'sha256'

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

    const pwdHash = crypto.createHash(hashAlg).update(password).digest('hex')
    if (pwdHash !== user.pwdHash) {
        return c.text('密码错误', 403)
    }

    const token = await sign(
        {
            ...user,
            exp: now() + jwtExpire
        },
        c.env.jwt_secret,
        signAlg
    )

    const encryptedToken = encrypt(token)
    setCookie(c, cookieName, encryptedToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: cookieExpire
    })

    return c.text('登录成功', 200)
})

export const needAuth = async (c, next) => {
    const encryptedToken = getCookie(c, cookieName)
    if (typeof encryptedToken === 'undefined') {
        return c.text('未授权', 401)
    }

    const token = decrypt(encryptedToken)
    try {
        const user = await verify(token, c.env.jwt_secret, signAlg)
        c.set(cookieName, user)
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
                    exp: now() + jwtExpire
                },
                c.env.jwt_secret,
                signAlg
            )

            const newEncryptedToken = encrypt(newToken)
            setCookie(c, cookieName, newEncryptedToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: cookieExpire
            })

            c.set(cookieName, user)
        } catch {
            return c.text('验证失败', 403)
        }
    }

    return await next()
}

export const needPermission = async (c, next) => {
    const user = c.get(cookieName)
    if (!user.isAdmin) {
        return c.text('无权限', 403)
    }

    return await next()
}

auth.get('/status', needAuth, c => {
    return c.text('验证成功', 200)
})

auth.get('/logout', needAuth, c => {
    deleteCookie(c, cookieName)
    return c.text('已登出', 200)
})

export default auth
