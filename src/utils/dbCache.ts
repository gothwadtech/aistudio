import { GrixFileNode, GitHubRepo } from "../types/github";

const DB_NAME = "gothwad_studio_db";
const DB_VERSION = 1;

export class DbCacheManager {
  private db: IDBDatabase | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains("keyval")) {
          db.createObjectStore("keyval");
        }
        if (!db.objectStoreNames.contains("dir_cache")) {
          db.createObjectStore("dir_cache");
        }
        if (!db.objectStoreNames.contains("file_cache")) {
          db.createObjectStore("file_cache");
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get<T>(storeName: "keyval" | "dir_cache" | "file_cache", key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result !== undefined ? request.result as T : null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn(`[DbCache] get failed for ${storeName}/${key}:`, e);
      // Fallback to localStorage for keyval
      if (storeName === "keyval") {
        try {
          const val = localStorage.getItem(key);
          return val ? JSON.parse(val) as T : null;
        } catch {}
      }
      return null;
    }
  }

  async set<T>(storeName: "keyval" | "dir_cache" | "file_cache", key: string, value: T): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn(`[DbCache] set failed for ${storeName}/${key}:`, e);
      if (storeName === "keyval") {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }
    }
  }

  async delete(storeName: "keyval" | "dir_cache" | "file_cache", key: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn(`[DbCache] delete failed for ${storeName}/${key}:`, e);
      if (storeName === "keyval") {
        try {
          localStorage.removeItem(key);
        } catch {}
      }
    }
  }

  async clearStore(storeName: "keyval" | "dir_cache" | "file_cache"): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn(`[DbCache] clearStore failed for ${storeName}:`, e);
    }
  }
}

export const dbCache = new DbCacheManager();
