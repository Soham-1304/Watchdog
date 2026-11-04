/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CUTAWAY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
