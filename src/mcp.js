import { Hono } from 'hono'
const mcp = new Hono()

import { needAuth, needPermission } from './auth.js'
mcp.use(needAuth)

import { mcps } from './db.js'
import db from './db.js'
import { eq } from 'drizzle-orm'

import isPlainObject from 'lodash.isplainobject'

mcp.get('/list', async c => {
    const result = await db()
        .select({
            name: mcps.name,
            url: mcps.url
        })
        .from(mcps)

    return c.json(result, 200)
})

mcp.get('/info', needPermission, async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    const result = await db().query.mcps.findFirst({
        where: (mcps, { eq }) => eq(mcps.name, name)
    })

    if (typeof result === 'undefined') {
        return c.text('MCP 不存在', 404)
    }

    return c.json(result, 200)
})

mcp.delete('/delete', needPermission, async c => {
    const { name } = c.req.query()
    if (typeof name !== 'string' || name === '') {
        return c.text('请求错误', 400)
    }

    await db().delete(mcps).where(eq(mcps.name, name))
    return c.text('删除成功', 200)
})

mcp.post('/save', needPermission, async c => {
    const { name, url, httpHeader } = await c.req.json()
    if (typeof name !== 'string' || name === '' || typeof url !== 'string' || url === '' || !isPlainObject(httpHeader)) {
        return c.text('请求错误', 400)
    }

    const oldMcp = await db().query.mcps.findFirst({
        columns: { name: true },
        where: (mcps, { eq }) => eq(mcps.name, name)
    })

    if (typeof oldMcp === 'undefined') {
        await db().insert(mcps).values({ name, url, httpHeader })
    } else {
        await db().update(mcps).set({ name, url, httpHeader }).where(eq(mcps.name, name))
    }

    return c.text('保存成功', 200)
})

export default mcp
