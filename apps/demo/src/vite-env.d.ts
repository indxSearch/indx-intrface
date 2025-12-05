/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INDX_URL: string
  readonly VITE_INDX_EMAIL: string
  readonly VITE_INDX_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
