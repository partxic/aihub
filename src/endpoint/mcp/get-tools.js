import pLimit from 'p-limit'

export default async (c, body) => {
    const limit = pLimit(6)
    try {
        const upstreamTools = (
            await Promise.all(
                c.get('mcps').map(mcp =>
                    limit(async () => {
                        let lastError = null

                        const reqHeader = new Headers(mcp.httpHeader)
                        reqHeader.set('Content-Type', 'application/json; charset=UTF-8')
                        reqHeader.set('Accept', 'application/json, text/event-stream')

                        for (let i = 1; i <= 5; i++) {
                            try {
                                const resp = await fetch(mcp.url, {
                                    method: 'POST',
                                    headers: reqHeader,
                                    body: JSON.stringify({
                                        id: body.id,
                                        jsonrpc: body.jsonrpc,
                                        method: 'tools/list'
                                    })
                                })

                                if (resp.ok) {
                                    const rawText = await resp.text()
                                    const rawJSON = rawText.includes('data:')
                                        ? rawText
                                              .split('\n')
                                              .filter(l => l.startsWith('data:'))
                                              .map(l => l.slice(5).trim())
                                              .join('')
                                        : rawText

                                    const tools = JSON.parse(rawJSON).result.tools
                                    return tools.map(item => ({
                                        ...item,
                                        name: `${mcp.name.replaceAll(' ', '_')}-${item.name}`
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

        return c.json(
            {
                id: body.id,
                jsonrpc: body.jsonrpc,
                result: {
                    tools: upstreamTools
                }
            },
            200
        )
    } catch (error) {
        return c.text(error.data, error.status)
    }
}
