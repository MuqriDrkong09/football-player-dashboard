const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io'

function getEnv(key: keyof ImportMetaEnv): string {
  return import.meta.env[key] ?? ''
}

export const apiConfig = {
  baseURL: getEnv('VITE_API_BASE_URL') || DEFAULT_BASE_URL,
  apiKey: getEnv('VITE_API_KEY'),
  timeout: 30_000,
} as const

export function assertApiKey(): void {
  if (!apiConfig.apiKey) {
    throw new Error(
      'VITE_API_KEY is not configured. Add your API-Football key to .env',
    )
  }
}
