import { Hono } from 'hono'
const models = new Hono()

import pLimit from 'p-limit'

import { unimodels } from '../../db.js'
import db from '../../db.js'
import cache from '../../cache.js'

import { now } from '../../auth.js'

models.get('/', async c => {
    const user = c.get('user')
    console.log(`${user.name}: get model list`)

    const limit = pLimit(6)
    try {
        const upstreamModels = (
            await Promise.all(
                c.get('providers').map(provider =>
                    limit(async () => {
                        let lastError = null

                        for (let i = 1; i <= 5; i++) {
                            try {
                                const resp = await fetch(`${provider.baseUrl}/models`, {
                                    headers: { Authorization: `Bearer ${provider.apiKey}` }
                                })

                                if (resp.ok) {
                                    const data = (await resp.json()).data
                                    return data.map(item => ({
                                        ...item,
                                        id: `${provider.name}/${item.id}`,
                                        owned_by: provider.name
                                    }))
                                }

                                lastError = { status: resp.status, data: await resp.text() }
                            } catch (error) {
                                lastError = { status: 500, data: String(error) }
                            }

                            await c.req.wait1s()
                        }

                        throw lastError
                    })
                )
            )
        ).flat()

        const uniModels = (
            await cache('unimodels:name', () =>
                db()
                    .select({
                        name: unimodels.name
                    })
                    .from(unimodels)
            )
        ).map(item => ({
            id: `unimodel/${item.name}`,
            object: 'model',
            created: now(),
            owned_by: 'system'
        }))

        return c.json(
            {
                object: 'list',
                data: [...upstreamModels, ...uniModels]
            },
            200
        )
    } catch (error) {
        return c.text(error.data, error.status)
    }
})

models.get('/:model{.*}', async c => {
    const model = c.req.param('model')
    const user = c.get('user')
    console.log(`${user.name}: get model ${model} info`)

    const spliterIdx = model.indexOf('/')
    const providerName = model.substring(0, spliterIdx)
    const modelName = model.substring(spliterIdx + 1)

    if (providerName === 'unimodel') {
        const unimodel = await cache(`unimodel:${modelName}`, () =>
            db().query.unimodels.findFirst({
                columns: { models: true },
                where: (unimodels, { eq }) => eq(unimodels.name, modelName)
            })
        )

        if (typeof unimodel === 'undefined') {
            return c.text('模型不存在', 404)
        }

        return c.json(
            {
                id: model,
                object: 'model',
                created: now(),
                owned_by: 'system',
                models: unimodel.models
            },
            200
        )
    }

    const provider = c.get('providers').find(provider => provider.name === providerName)
    if (typeof provider === 'undefined') {
        return c.text('供应不存在', 404)
    }

    return await fetch(`${provider.baseUrl}/models/${encodeURIComponent(modelName)}`, {
        headers: { Authorization: `Bearer ${provider.apiKey}` }
    })
})

export default models
