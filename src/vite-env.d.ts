/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PERFORMANCE_MONITORING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}