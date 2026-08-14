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
