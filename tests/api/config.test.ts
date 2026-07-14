import {
  apiConfig,
  assertApiKey,
  createApiConfig,
} from '@/api/config'

describe('api/config', () => {
  describe('createApiConfig', () => {
    it('uses provided Vite env values', () => {
      expect(
        createApiConfig({
          VITE_API_BASE_URL: 'https://custom.api',
          VITE_API_KEY: 'secret-key',
        }),
      ).toEqual({
        baseURL: 'https://custom.api',
        apiKey: 'secret-key',
        timeout: 30_000,
      })
    })

    it('falls back to the default API base URL when env is empty', () => {
      expect(
        createApiConfig({
          VITE_API_BASE_URL: '',
          VITE_API_KEY: 'key',
        }).baseURL,
      ).toBe('https://v3.football.api-sports.io')
    })

    it('treats missing env values as empty strings', () => {
      const config = createApiConfig({} as ImportMetaEnv)

      expect(config.baseURL).toBe('https://v3.football.api-sports.io')
      expect(config.apiKey).toBe('')
      expect(config.timeout).toBe(30_000)
    })
  })

  describe('apiConfig', () => {
    it('is initialized from the Jest-mocked Vite env', () => {
      expect(apiConfig.apiKey).toBe('test-api-key')
      expect(apiConfig.baseURL).toBe('https://api.test')
      expect(apiConfig.timeout).toBe(30_000)
    })
  })

  describe('assertApiKey', () => {
    it('does not throw when an API key is present', () => {
      expect(() => assertApiKey()).not.toThrow()
      expect(() =>
        assertApiKey({ apiKey: 'present' }),
      ).not.toThrow()
    })

    it('throws when the API key is missing', () => {
      expect(() => assertApiKey({ apiKey: '' })).toThrow(
        'VITE_API_KEY is not configured. Add your API-Football key to .env',
      )
    })
  })
})
