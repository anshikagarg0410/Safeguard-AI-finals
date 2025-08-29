/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUSHOVER_ENABLED?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}