/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_SECRET_KEY?: string
  readonly VITE_CLERK_IS_SATELLITE?: string
  readonly VITE_CLERK_DOMAIN?: string
  readonly VITE_CLERK_SIGN_IN_URL?: string
  readonly VITE_CLERK_SIGN_UP_URL?: string
  readonly VITE_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
