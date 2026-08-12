import { Hono } from 'hono'
const provider = new Hono()

import { cookieName, needAuth, needPermission } from './auth.js'
provider.use(needAuth)

import { providers } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

provider.get('/list', async c => {
    const result = await db()
        .select({
            name: providers.name,
            baseUrl: providers.baseUrl
        })
        .from(providers)

    return c.json(result, 200)
})

provider.get('/info', needPermission, async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db().query.providers.findFirst({
        where: (providers, { eq }) => eq(providers.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('供应不存在', 404)
    }

    return c.json(result, 200)
})

provider.delete('/delete', needPermission, async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    await db().delete(providers).where(eq(providers.name, name))
    return c.text('删除成功', 200)
})

provider.post('/save', needPermission, async c => {
    const { name, baseUrl, apiKey } = await c.req.json()
    if (typeof name !== 'string' || name === '' || typeof baseUrl !== 'string' || baseUrl === '' || typeof apiKey !== 'string') {
        return c.text('请求错误', 400)
    }

    const oldProvider = await db().query.providers.findFirst({
        columns: { name: true },
        where: (providers, { eq }) => eq(providers.name, name)
    })

    if (typeof oldProvider === 'undefined') {
        await db().insert(providers).values({ name, baseUrl, apiKey })
    } else {
        await db().update(providers).set({ name, baseUrl, apiKey }).where(eq(providers.name, name))
    }

    return c.text('保存成功', 200)
})

export default provider
