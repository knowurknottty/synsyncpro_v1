/**
 * @fileoverview Storage abstraction: OPFS primary, IndexedDB blob fallback.
 *
 * Storage comparison:
 *   OPFS (Origin Private File System):
 *     - Introduced in browsers: Chrome 86+, Safari 15.2+, Firefox 111+
 *     - Fastest: direct file I/O, no JS-level serialization overhead
 *     - Origin-private: inaccessible to other origins, not synced to cloud
 *     - Not accessible to file picker APIs — user cannot accidentally browse to it
 *     - Available in Workers (important for future off-main-thread ops)
 *
 *   IndexedDB fallback:
 *     - Universal browser support
 *     - Stores ArrayBuffer as Blob — origin-scoped, not user-browseable
 *     - Slightly higher latency due to IDB transaction overhead
 *     - Same security guarantees: origin-isolated, encrypted at rest by OS
 *
 * Neither backend exposes data to other origins. The encryption layer provides
 * defense-in-depth against OS-level file access (e.g., browser profile extraction).
 *
 * Storage lifecycle:
 *   - Backend is detected once per module load and cached
 *   - resetStorageBackend() forces re-detection (call after permissions change)
 *   - Errors thrown as Error instances with descriptive messages
 */

const IDB_DB_NAME = 'synsync-v1';
const IDB_STORE_NAME = 'profile';
const IDB_PROFILE_KEY = 'user-profile-enc';

export type StorageBackendType = 'opfs' | 'indexeddb';

export interface StorageBackend {
  /** Storage mechanism type — useful for diagnostics */
  readonly type: StorageBackendType;
  /**
   * Read stored profile bytes.
   * Returns null if no profile has been stored.
   * Throws on I/O errors.
   */
  read(): Promise<Uint8Array | null>;
  /**
   * Write profile bytes.
   * Overwrites any existing profile.
   * Throws on I/O errors or storage quota exhaustion.
   */
  write(data: Uint8Array): Promise<void>;
  /**
   * Delete stored profile.
   * No-op if no profile exists.
   * Throws on I/O errors.
   */
  clear(): Promise<void>;
}

// ─── OPFS Backend ─────────────────────────────────────────────────────────────

async function isOpfsAvailable(): Promise<boolean> {
  try {
    if (
      typeof navigator === 'undefined' ||
      !('storage' in navigator) ||
      !('getDirectory' in navigator.storage)
    ) {
      return false;
    }
    // Test actual access — availability check alone is insufficient
    await navigator.storage.getDirectory();
    return true;
  } catch {
    return false;
  }
}

function createOpfsBackend(fileName: string): StorageBackend {
  return {
    type: 'opfs',

    async read(): Promise<Uint8Array | null> {
      let root: FileSystemDirectoryHandle;
      try {
        root = await navigator.storage.getDirectory();
      } catch (e) {
        throw new Error(`OPFS getDirectory failed: ${(e as Error).message}`);
      }

      try {
        const fileHandle = await root.getFileHandle(fileName, { create: false });
        const file = await fileHandle.getFile();
        return new Uint8Array(await file.arrayBuffer());
      } catch (e) {
        const domError = e as DOMException;
        if (domError.name === 'NotFoundError') return null;
        throw new Error(`OPFS read failed for "${fileName}": ${domError.message}`);
      }
    },

    async write(data: Uint8Array): Promise<void> {
      let root: FileSystemDirectoryHandle;
      try {
        root = await navigator.storage.getDirectory();
      } catch (e) {
        throw new Error(`OPFS getDirectory failed: ${(e as Error).message}`);
      }

      let fileHandle: FileSystemFileHandle;
      try {
        fileHandle = await root.getFileHandle(fileName, { create: true });
      } catch (e) {
        throw new Error(`OPFS getFileHandle failed for "${fileName}": ${(e as Error).message}`);
      }

      let writable: FileSystemWritableFileStream;
      try {
        writable = await fileHandle.createWritable();
      } catch (e) {
        throw new Error(`OPFS createWritable failed: ${(e as Error).message}`);
      }

      try {
        await writable.write(data);
        await writable.close();
      } catch (e) {
        // Best-effort abort on write failure
        try { await writable.abort(); } catch { /* ignore abort error */ }
        throw new Error(`OPFS write failed: ${(e as Error).message}`);
      }
    },

    async clear(): Promise<void> {
      let root: FileSystemDirectoryHandle;
      try {
        root = await navigator.storage.getDirectory();
      } catch (e) {
        throw new Error(`OPFS getDirectory failed: ${(e as Error).message}`);
      }

      try {
        await root.removeEntry(fileName);
      } catch (e) {
        const domError = e as DOMException;
        if (domError.name === 'NotFoundError') return; // already gone
        throw new Error(`OPFS removeEntry failed for "${fileName}": ${domError.message}`);
      }
    },
  };
}

// ─── IndexedDB Backend ────────────────────────────────────────────────────────

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    req.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    req.onerror = (event) => reject(
      new Error(`IDB open failed: ${(event.target as IDBOpenDBRequest).error?.message}`),
    );
    req.onblocked = () => reject(
      new Error('IDB open blocked — another tab has the database open with an older version'),
    );
  });
}

function idbTransaction<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(IDB_STORE_NAME, mode);
    } catch (e) {
      return reject(new Error(`IDB transaction failed: ${(e as Error).message}`));
    }

    tx.onerror = (event) => reject(
      new Error(`IDB transaction error: ${(event.target as IDBTransaction).error?.message}`),
    );

    const req = fn(tx.objectStore(IDB_STORE_NAME));
    req.onsuccess = (event) => resolve((event.target as IDBRequest<T>).result);
    req.onerror = (event) => reject(
      new Error(`IDB request error: ${(event.target as IDBRequest).error?.message}`),
    );
  });
}

function createIdbBackend(): StorageBackend {
  return {
    type: 'indexeddb',

    async read(): Promise<Uint8Array | null> {
      let db: IDBDatabase;
      try {
        db = await openIdb();
      } catch (e) {
        throw new Error(`IDB open failed: ${(e as Error).message}`);
      }
      try {
        const result = await idbTransaction<ArrayBuffer | undefined>(
          db, 'readonly', store => store.get(IDB_PROFILE_KEY),
        );
        return result ? new Uint8Array(result) : null;
      } finally {
        db.close();
      }
    },

    async write(data: Uint8Array): Promise<void> {
      let db: IDBDatabase;
      try {
        db = await openIdb();
      } catch (e) {
        throw new Error(`IDB open failed: ${(e as Error).message}`);
      }
      try {
        // Store a copy of the buffer — slice() creates an owned copy
        await idbTransaction(
          db, 'readwrite', store => store.put(data.buffer.slice(0), IDB_PROFILE_KEY),
        );
      } finally {
        db.close();
      }
    },

    async clear(): Promise<void> {
      let db: IDBDatabase;
      try {
        db = await openIdb();
      } catch (e) {
        throw new Error(`IDB open failed: ${(e as Error).message}`);
      }
      try {
        await idbTransaction(db, 'readwrite', store => store.delete(IDB_PROFILE_KEY));
      } finally {
        db.close();
      }
    },
  };
}

// ─── Backend Selection ────────────────────────────────────────────────────────

let _cachedBackend: StorageBackend | null = null;

/**
 * Get or initialize the storage backend.
 * Selection order: OPFS → IndexedDB.
 * Result is cached after first call.
 *
 * @param opfsFileName  File name for OPFS storage
 */
export async function getStorageBackend(opfsFileName: string): Promise<StorageBackend> {
  if (_cachedBackend) return _cachedBackend;

  if (await isOpfsAvailable()) {
    _cachedBackend = createOpfsBackend(opfsFileName);
  } else {
    console.warn(
      '[SynSync] OPFS unavailable (browser too old or non-secure context). ' +
      'Falling back to IndexedDB storage. Data is still encrypted and origin-isolated.',
    );
    _cachedBackend = createIdbBackend();
  }

  return _cachedBackend;
}

/**
 * Force re-detection of storage backend.
 * Call after browser permissions change or for testing.
 */
export function resetStorageBackend(): void {
  _cachedBackend = null;
}

/**
 * Returns the currently cached backend type without triggering detection.
 * Returns null if backend has not been initialized yet.
 */
export function getCurrentBackendType(): StorageBackendType | null {
  return _cachedBackend?.type ?? null;
}
