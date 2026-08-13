const caches = new Map()
const inflightFetcher = new Map()
const maxAge = 2 * 60 * 1000

export default async (key, fetcher) => {
    const now = Date.now()

    if (caches.has(key)) {
        const entry = caches.get(key)
        if (now < entry.expiry) {
            console.log(`[CACHE HIT] key="${key}"`)
            return entry.data
        }

        console.log(`[CACHE MISS - EXPIRED] key="${key}"`)
        caches.delete(key)
    }

    if (inflightFetcher.has(key)) {
        console.log(`[INFLIGHT MERGE] key="${key}"`)
        return await inflightFetcher.get(key)
    }

    console.log(`[CACHE MISS - FETCH] key="${key}"`)
    const promise = (async () => {
        try {
            const data = await fetcher()
            if (data !== undefined && data !== null) {
                caches.set(key, { expiry: Date.now() + maxAge, data })
                console.log(`[CACHE POPULATE] key="${key}"`)
            } else {
                console.log(`[CACHE SKIP - EMPTY] key="${key}"`)
            }

            return data
        } finally {
            inflightFetcher.delete(key)
        }
    })()

    inflightFetcher.set(key, promise)
    return await promise
}
