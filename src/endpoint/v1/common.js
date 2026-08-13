import db from '../../db.js'

export default async c => {
    const body = await c.req.json()
    const { model } = body

    const user = c.get('user')
    console.log(`${user.name}: call ${model}`)

    const spliterIdx = model.indexOf('/')
    const providerName = model.substring(0, spliterIdx)
    const modelName = model.substring(spliterIdx + 1)

    const models = []
    if (providerName === 'unimodel') {
        const unimodel = await db().query.unimodels.findFirst({
            columns: { models: true },
            where: (unimodels, { eq }) => eq(unimodels.name, modelName)
        })

        if (typeof unimodel === 'undefined') {
            return c.text('模型不存在', 404)
        }

        unimodel.models.forEach(item => {
            const spliterIdx = item.indexOf('/')
            const providerName = item.substring(0, spliterIdx)
            const modelName = item.substring(spliterIdx + 1)
            models.push({ providerName, modelName })
        })
    } else {
        models.push({ providerName, modelName })
    }

    try {
        let lastError = { status: 404, data: '无可用模型' }

        const commonHeader = new Headers()
        commonHeader.set('Content-Type', 'application/json; charset=UTF-8')
        const allowedPrefixes = ['x-', 'anthropic-', 'user-']
        for (const [key, value] of Object.entries(c.req.header())) {
            const lowerKey = key.toLowerCase()
            const isAllowed = allowedPrefixes.some(prefix => lowerKey.startsWith(prefix.toLowerCase()))
            if (isAllowed) {
                commonHeader.set(key, value)
            }
        }

        for (const model of models) {
            const provider = c.get('providers').find(provider => provider.name === model.providerName)
            if (typeof provider === 'undefined') {
                return c.text('供应不存在', 404)
            }

            const reqHeader = new Headers(commonHeader)
            reqHeader.set('Authorization', `Bearer ${provider.apiKey}`)

            for (let i = 1; i <= 5; i++) {
                try {
                    body.model = model.modelName
                    const resp = await fetch(`${provider.baseUrl}/chat/completions`, {
                        method: 'POST',
                        headers: reqHeader,
                        body: JSON.stringify(body)
                    })

                    if (resp.ok) return resp
                    lastError = { status: resp.status, data: await resp.text() }
                } catch (error) {
                    lastError = { status: 500, data: String(error) }
                }

                await c.req.wait1s()
            }
        }

        throw lastError
    } catch (error) {
        return c.text(error.data, error.status)
    }
}
