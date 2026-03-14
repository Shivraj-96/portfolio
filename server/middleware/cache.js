/**
 * cache.js  —  Simple in-memory API response cache for Express
 * Place this at: server/middleware/cache.js
 *
 * How it works:
 *  - First request hits MongoDB, stores result in memory with a timestamp
 *  - Subsequent requests within TTL get the cached response (no DB hit)
 *  - Cache auto-expires after TTL seconds
 *  - Cache is cleared automatically when you POST/PUT/DELETE data
 */

const store = new Map(); // key → { data, expiresAt }

/**
 * Cache middleware factory.
 * @param {number} ttlSeconds  How long to cache the response (default: 60s)
 *
 * Usage in server.js:
 *   const { cacheMiddleware, clearCache } = require('./middleware/cache');
 *   app.get('/api/skills',   cacheMiddleware(120), async (req, res) => { ... });
 *   app.post('/api/skills',  async (req, res) => { clearCache('/api/skills'); ... });
 */
function cacheMiddleware(ttlSeconds = 60) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const now = Date.now();

    // ── Cache HIT ──
    if (store.has(key)) {
      const entry = store.get(key);
      if (now < entry.expiresAt) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', Math.round((entry.expiresAt - now) / 1000) + 's');
        return res.json(entry.data);
      }
      // Expired — remove it
      store.delete(key);
    }

    // ── Cache MISS: intercept res.json to store result ──
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, { data, expiresAt: now + ttlSeconds * 1000 });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear one or all cache entries.
 * Call this after POST / PUT / DELETE so stale data is never served.
 *
 * @param {string} [keyPrefix]  URL prefix to clear, e.g. '/api/skills'
 *                              If omitted, clears everything.
 */
function clearCache(keyPrefix) {
  if (!keyPrefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}

/** How many entries are in the cache right now */
function cacheSize() { return store.size; }

module.exports = { cacheMiddleware, clearCache, cacheSize };