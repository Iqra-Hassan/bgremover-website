export interface LocalMediaItem {
  id: string;
  url: string;
  key: string;
  fileName: string;
  size: number;
  mimeType: string;
  storageType: 'local';
  libraryMedia: boolean;
  createdAt: string;
  updatedAt: string;
  file: Blob;
}

export interface LocalHistoryItem {
  id: string;
  inputUrl: string;
  outputUrl: string;
  maskUrl?: string;
  isFree: boolean;
  createdAt: string;
  inputFile: Blob;
  outputFile: Blob;
  maskFile?: Blob;
}

class LocalDB {
  private dbName = 'eraseo-local-store';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private urlCache = new Map<string, string>();

  private getDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is only available in the browser'));
        return;
      }
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveMedia(id: string, file: Blob, fileName: string, mimeType: string): Promise<LocalMediaItem> {
    const db = await this.getDB();
    const item = {
      id,
      key: id,
      fileName,
      size: file.size,
      mimeType,
      storageType: 'local' as const,
      libraryMedia: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file,
    };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('media', 'readwrite');
      const store = transaction.objectStore('media');
      const request = store.put(item);
      request.onsuccess = () => {
        const url = URL.createObjectURL(file);
        this.urlCache.set(id, url);
        resolve({ ...item, url });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMediaList(): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('media', 'readonly');
      const store = transaction.objectStore('media');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        const mapped = items.map((item) => {
          let url = this.urlCache.get(item.id);
          if (!url) {
            url = URL.createObjectURL(item.file);
            this.urlCache.set(item.id, url);
          }
          return {
            id: item.id,
            url,
            key: item.key,
            fileName: item.fileName,
            size: item.size,
            mimeType: item.mimeType,
            storageType: item.storageType,
            libraryMedia: item.libraryMedia,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        });
        resolve(mapped);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMedia(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('media', 'readwrite');
      const store = transaction.objectStore('media');
      const request = store.delete(id);
      request.onsuccess = () => {
        const cachedUrl = this.urlCache.get(id);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
          this.urlCache.delete(id);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveHistory(
    id: string,
    inputFile: Blob,
    outputFile: Blob,
    maskFile?: Blob
  ): Promise<any> {
    const db = await this.getDB();
    const item = {
      id,
      createdAt: new Date().toISOString(),
      inputFile,
      outputFile,
      maskFile,
      isFree: true,
    };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('history', 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.put(item);
      request.onsuccess = () => {
        resolve(item);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getHistoryList(): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('history', 'readonly');
      const store = transaction.objectStore('history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result || [];
        const mapped = items.map((item) => {
          let inputUrl = this.urlCache.get(item.id + '_input');
          if (!inputUrl) {
            inputUrl = URL.createObjectURL(item.inputFile);
            this.urlCache.set(item.id + '_input', inputUrl);
          }
          let outputUrl = this.urlCache.get(item.id + '_output');
          if (!outputUrl) {
            outputUrl = URL.createObjectURL(item.outputFile);
            this.urlCache.set(item.id + '_output', outputUrl);
          }
          let maskUrl = undefined;
          if (item.maskFile) {
            maskUrl = this.urlCache.get(item.id + '_mask');
            if (!maskUrl) {
              maskUrl = URL.createObjectURL(item.maskFile);
              this.urlCache.set(item.id + '_mask', maskUrl);
            }
          }
          return {
            id: item.id,
            inputUrl,
            outputUrl,
            maskUrl,
            isFree: item.isFree,
            createdAt: item.createdAt,
          };
        });
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(mapped);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHistory(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('history', 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.delete(id);
      request.onsuccess = () => {
        const inUrl = this.urlCache.get(id + '_input');
        if (inUrl) {
          URL.revokeObjectURL(inUrl);
          this.urlCache.delete(id + '_input');
        }
        const outUrl = this.urlCache.get(id + '_output');
        if (outUrl) {
          URL.revokeObjectURL(outUrl);
          this.urlCache.delete(id + '_output');
        }
        const mUrl = this.urlCache.get(id + '_mask');
        if (mUrl) {
          URL.revokeObjectURL(mUrl);
          this.urlCache.delete(id + '_mask');
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalDB();
