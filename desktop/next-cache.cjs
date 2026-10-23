const entries = new Map();

module.exports = class MemoryCache {
  async get(key) {
    return entries.get(key) ?? null;
  }

  async set(key, data, ctx) {
    entries.set(key, { value: data, lastModified: Date.now(), tags: ctx?.tags ?? [] });
  }

  async revalidateTag(tags) {
    const wanted = [tags].flat();
    for (const [key, entry] of entries) {
      if (entry.tags.some((tag) => wanted.includes(tag))) entries.delete(key);
    }
  }

  resetRequestCache() {}
};
