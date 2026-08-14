import { Hono } from 'hono'
const mcp = new Hono()

import { mcps } from '../db.js'
import db from '../db.js'
import cache from '../cache.js'
mcp.use(async (c, next) => {
    c.set('mcps', await cache('mcps', () => db().select().from(mcps)))
    return await next()
})

import getTools from './mcp/get-tools.js'

mcp.get('/', c => {
    return c.body(null, 405)
})

mcp.post('/', async c => {
    const body = await c.req.json()
    const { method } = body

    const user = c.get('user')
    console.log(`${user.name}: call mcp: ${method}`)

    switch (method) {
        case 'initialize':
            return c.json(
                {
                    id: body.id,
                    jsonrpc: body.jsonrpc,
                    result: {
                        protocolVersion: body.params.protocolVersion,
                        capabilities: {
                            tools: {}
                        },
                        serverInfo: {
                            name: 'aihub-mcp',
                            version: '1.0.0'
                        }
                    }
                },
                200
            )

        case 'notifications/initialized':
            return c.body(null, 202)

        case 'tools/list':
            return await getTools(c, body)

        default:
            return c.text(`unknown method: ${method}`, 404)
    }
})

export default mcp
