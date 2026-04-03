const DB_NAME = "ziona-offline";
const DB_VERSION = 1;

export const STORES = {
  kv: "kv",
  outbox: "outbox",
} as const;

type IDBRequestResult<T> = Promise<T>;

function reqToPromise<T>(req: IDBRequest<T>): IDBRequestResult<T> {
  return new Promise((resolve, reject) => {
    req.addEventListener("success", () => resolve(req.result));
    req.addEventListener("error", () => reject(req.error));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.addEventListener("complete", () => resolve());
    tx.addEventListener("error", () => reject(tx.error));
    tx.addEventListener("abort", () => reject(tx.error));
  });
}

export function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("indexedDB no disponible"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.addEventListener("error", () => reject(req.error));
    req.addEventListener("success", () => resolve(req.result));
    req.addEventListener("upgradeneeded", () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.kv)) {
        db.createObjectStore(STORES.kv);
      }
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        db.createObjectStore(STORES.outbox, { autoIncrement: true });
      }
    });
  });
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(STORES.kv, "readonly");
  const store = tx.objectStore(STORES.kv);
  const v = await reqToPromise(store.get(key) as IDBRequest<T | undefined>);
  await txDone(tx);
  db.close();
  return v;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORES.kv, "readwrite");
  const store = tx.objectStore(STORES.kv);
  await reqToPromise(store.put(value, key));
  await txDone(tx);
  db.close();
}

export async function kvDel(key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORES.kv, "readwrite");
  const store = tx.objectStore(STORES.kv);
  await reqToPromise(store.delete(key));
  await txDone(tx);
  db.close();
}

export type OutboxRecord<T> = T & { id: number };

export async function outboxAdd<T extends object>(entry: T): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.outbox, "readwrite");
    const store = tx.objectStore(STORES.outbox);
    const r = store.add({ ...entry, createdAt: Date.now() });
    r.addEventListener("success", () => resolve(r.result as number));
    r.addEventListener("error", () => reject(r.error));
    tx.addEventListener("complete", () => db.close());
  });
}

export async function outboxGetAll<T extends object>(): Promise<OutboxRecord<T & { createdAt: number }>[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.outbox, "readonly");
    const store = tx.objectStore(STORES.outbox);
    const out: OutboxRecord<T & { createdAt: number }>[] = [];
    const r = store.openCursor();
    r.addEventListener("success", () => {
      const cursor = r.result;
      if (!cursor) {
        resolve(out);
        return;
      }
      const id = cursor.key as number;
      out.push({ ...(cursor.value as T & { createdAt: number }), id });
      cursor.continue();
    });
    r.addEventListener("error", () => reject(r.error));
    tx.addEventListener("complete", () => db.close());
  });
}

export async function outboxDelete(id: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORES.outbox, "readwrite");
  const store = tx.objectStore(STORES.outbox);
  await reqToPromise(store.delete(id));
  await txDone(tx);
  db.close();
}

export async function outboxClear(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORES.outbox, "readwrite");
  const store = tx.objectStore(STORES.outbox);
  await reqToPromise(store.clear());
  await txDone(tx);
  db.close();
}
