export default async (c, body) => {
    const { name } = body.params

    const spliterIdx = name.indexOf('-')
    const mcpName = name.substring(0, spliterIdx).replaceAll('_', ' ')
    body.params.name = name.substring(spliterIdx + 1)

    try {
        let lastError = null

        const mcp = c.get('mcps').find(mcp => mcp.name === mcpName)
        if (typeof mcp === 'undefined') {
            return c.text('MCP 不存在', 404)
        }

        const reqHeader = new Headers(mcp.httpHeader)
        reqHeader.set('Content-Type', 'application/json; charset=UTF-8')
        reqHeader.set('Accept', 'application/json, text/event-stream')

        for (let i = 1; i <= 5; i++) {
            try {
                const resp = await fetch(mcp.url, {
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

        throw lastError
    } catch (error) {
        return c.text(error.data, error.status)
    }
}
