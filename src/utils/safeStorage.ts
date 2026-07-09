// Bulletproof in-memory fallback helper for environments with blocked or buggy storage (like TV browsers, custom set-top box web views, or security-restricted frames).
const inMemoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage blocked or failed on getItem(${key}). Using in-memory fallback.`, e);
    }
    return key in inMemoryStore ? inMemoryStore[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage blocked or failed on setItem(${key}). Using in-memory fallback.`, e);
    }
    inMemoryStore[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage blocked or failed on removeItem(${key}). Using in-memory fallback.`, e);
    }
    delete inMemoryStore[key];
  },

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("[SafeStorage] localStorage blocked or failed on clear(). Using in-memory fallback.", e);
    }
    for (const key in inMemoryStore) {
      delete inMemoryStore[key];
    }
  }
};
