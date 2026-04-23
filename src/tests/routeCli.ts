/** One-shot CLI: `npx tsx src/tests/routeCli.ts` — polyfills localStorage for zustand/persist in Node. */
const memory: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem(k: string) {
      return memory[k] ?? null;
    },
    setItem(k: string, v: string) {
      memory[k] = String(v);
    },
    removeItem(k: string) {
      delete memory[k];
    },
    clear() {
      for (const k of Object.keys(memory)) delete memory[k];
    },
    key(i: number) {
      return Object.keys(memory)[i] ?? null;
    },
    get length() {
      return Object.keys(memory).length;
    },
  } as unknown as Storage;
}

const { runTests } = await import('./routeTest');
await runTests();
