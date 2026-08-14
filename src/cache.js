const caches = new Map()
const inflightFetcher = new Map()
const maxAge = 2 * 60 * 1000

export default async (key, fetcher) => {
    const now = Date.now()

    if (caches.has(key)) {
        const entry = caches.get(key)
        if (now < entry.expiry) {
            return entry.data
        }

        caches.delete(key)
    }

    if (inflightFetcher.has(key)) {
        return await inflightFetcher.get(key)
    }

    const promise = (async () => {
        try {
            const data = await fetcher()
            if (data !== undefined && data !== null) {
                caches.set(key, { expiry: Date.now() + maxAge, data })
            }

            return data
        } finally {
            inflightFetcher.delete(key)
        }
    })()

    inflightFetcher.set(key, promise)
    return await promise
}

import { Hono } from 'hono'
export const cache = new Hono()

import { needAuth } from './auth.js'
cache.use(needAuth)

cache.get('/list', c => {
    const now = Date.now()
    const list = []

    for (const [key, entry] of caches.entries()) {
        if (now >= entry.expiry) {
            caches.delete(key)
            continue
        }

        list.push({
            key,
            data: entry.data
        })
    }

    return c.json(list, 200)
})

cache.delete('/delete', c => {
    const { key } = c.req.query()

    if (typeof key === 'string' && key !== '') {
        caches.delete(key)
    } else {
        caches.clear()
    }

    return c.text('删除成功', 200)
})
