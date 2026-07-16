/** Same-origin path proxied to API-Football in Vite (see vite.config.ts). */
const DEFAULT_BASE_URL = '/api'

type ApiEnv = Pick<ImportMetaEnv, 'VITE_API_BASE_URL' | 'VITE_API_KEY'>

function getEnv(env: ApiEnv, key: keyof ApiEnv): string {
  return env[key] ?? ''
}

/** Builds API client settings from Vite env values. */
export function createApiConfig(env: ApiEnv = import.meta.env) {
  return {
    baseURL: getEnv(env, 'VITE_API_BASE_URL') || DEFAULT_BASE_URL,
    apiKey: getEnv(env, 'VITE_API_KEY'),
    timeout: 30_000,
  } as const
}

export const apiConfig = createApiConfig()

export function assertApiKey(
  config: Pick<typeof apiConfig, 'apiKey'> = apiConfig,
): void {
  if (!config.apiKey) {
    throw new Error(
      'VITE_API_KEY is not configured. Add your API-Football key to .env',
    )
  }
}
