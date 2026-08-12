import { Hono } from 'hono'
const unimodel = new Hono()

import { needAuth, needPermission } from './auth.js'
unimodel.use(needAuth)

import { unimodels } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

unimodel.get('/list', async c => {
    const result = await db()
        .select({
            name: unimodels.name
        })
        .from(unimodels)

    return c.json(result, 200)
})

unimodel.get('/info', async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db().query.unimodels.findFirst({
        where: (unimodels, { eq }) => eq(unimodels.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('模型不存在', 404)
    }

    return c.json(result, 200)
})

unimodel.delete('/delete', needPermission, async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    await db().delete(unimodels).where(eq(unimodels.name, name))
    return c.text('删除成功', 200)
})

unimodel.post('/save', needPermission, async c => {
    const { name, models } = await c.req.json()
    if (typeof name !== 'string' || name === '' || !Array.isArray(models)) {
        return c.text('请求错误', 400)
    }

    const oldUniModel = await db().query.unimodels.findFirst({
        columns: { name: true },
        where: (unimodels, { eq }) => eq(unimodels.name, name)
    })

    if (typeof oldUniModel === 'undefined') {
        await db().insert(unimodels).values({ name, models })
    } else {
        await db().update(unimodels).set({ name, models }).where(eq(unimodels.name, name))
    }

    return c.text('保存成功', 200)
})

unimodel.get('/model-list', async c => {
    const { provider } = c.req.query()
    if (typeof provider !== 'string' || provider === '') {
        return c.text('请求错误', 400)
    }

    const result = await db().query.providers.findFirst({
        columns: { baseUrl: true, apiKey: true },
        where: (providers, { eq }) => eq(providers.name, provider)
    })

    if (typeof result === 'undefined') {
        return c.text('供应不存在', 404)
    }

    const apiUrl = `${result.baseUrl}/models`
    const headers = result.apiKey === '' ? {} : { Authorization: `Bearer ${result.apiKey}` }
    return await fetch(apiUrl, { headers })
})

export default unimodel
