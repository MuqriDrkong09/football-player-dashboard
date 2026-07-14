import { apiClient, apiGet, apiRequest } from '@/api/client'
import { ApiError } from '@/api/errors'
import type { ApiFootballResponse } from '@/types/api-football'

describe('api/client', () => {
  const requestSpy = jest.spyOn(apiClient, 'request')

  afterEach(() => {
    requestSpy.mockReset()
  })

  afterAll(() => {
    requestSpy.mockRestore()
  })

  describe('apiClient', () => {
    it('is created with the configured base URL, timeout, and JSON headers', () => {
      expect(apiClient.defaults.baseURL).toBe('https://api.test')
      expect(apiClient.defaults.timeout).toBe(30_000)

      const headers = apiClient.defaults.headers as Record<string, unknown> & {
        common?: Record<string, unknown>
      }
      const contentType =
        headers['Content-Type'] ??
        headers.common?.['Content-Type'] ??
        headers.common?.['content-type']

      expect(contentType).toBe('application/json')
    })

    it('registers interceptors on the shared client', () => {
      expect(apiClient.interceptors.request).toBeDefined()
      expect(apiClient.interceptors.response).toBeDefined()
      expect(
        // Axios stores handlers on these arrays after setupInterceptors()
        (apiClient.interceptors.request as { handlers?: unknown[] }).handlers
          ?.length ?? 0,
      ).toBeGreaterThan(0)
      expect(
        (apiClient.interceptors.response as { handlers?: unknown[] }).handlers
          ?.length ?? 0,
      ).toBeGreaterThan(0)
    })
  })

  describe('apiRequest', () => {
    it('returns the response payload on success', async () => {
      const payload: ApiFootballResponse<string[]> = {
        get: '/players',
        parameters: { league: 39 },
        errors: [],
        results: 2,
        paging: { current: 1, total: 1 },
        response: ['a', 'b'],
      }

      requestSpy.mockResolvedValueOnce({ data: payload })

      await expect(
        apiRequest<string[]>({ method: 'GET', url: '/players' }),
      ).resolves.toEqual(payload)

      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: '/players',
      })
    })

    it('wraps thrown errors with ApiError.fromUnknown', async () => {
      requestSpy.mockRejectedValueOnce(new Error('socket hang up'))

      await expect(
        apiRequest({ method: 'GET', url: '/players' }),
      ).rejects.toMatchObject({
        name: 'ApiError',
        message: 'socket hang up',
        code: 'UNKNOWN',
      })
    })

    it('rethrows existing ApiError instances without double-wrapping', async () => {
      const existing = new ApiError('Already normalized', {
        code: 'RATE_LIMIT',
        statusCode: 429,
      })
      requestSpy.mockRejectedValueOnce(existing)

      await expect(
        apiRequest({ method: 'GET', url: '/players' }),
      ).rejects.toBe(existing)
    })
  })

  describe('apiGet', () => {
    it('issues a GET request and maps the API response into a PaginatedResult', async () => {
      const payload: ApiFootballResponse<{ id: number }[]> = {
        get: '/teams',
        parameters: { league: 39, season: 2024 },
        errors: {},
        results: 1,
        paging: { current: 1, total: 3 },
        response: [{ id: 33 }],
      }

      requestSpy.mockResolvedValueOnce({ data: payload })

      await expect(
        apiGet<{ id: number }[]>('/teams', { league: 39, season: 2024 }),
      ).resolves.toEqual({
        data: [{ id: 33 }],
        results: 1,
        paging: { current: 1, total: 3 },
      })

      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: '/teams',
        params: { league: 39, season: 2024 },
      })
    })

    it('supports GET requests without query params', async () => {
      const payload: ApiFootballResponse<number[]> = {
        get: '/players/seasons',
        parameters: {},
        errors: [],
        results: 0,
        paging: { current: 1, total: 1 },
        response: [],
      }

      requestSpy.mockResolvedValueOnce({ data: payload })

      await expect(apiGet<number[]>('/players/seasons')).resolves.toEqual({
        data: [],
        results: 0,
        paging: { current: 1, total: 1 },
      })

      expect(requestSpy).toHaveBeenCalledWith({
        method: 'GET',
        url: '/players/seasons',
        params: undefined,
      })
    })

    it('propagates ApiError when the underlying request fails', async () => {
      requestSpy.mockRejectedValueOnce(new Error('boom'))

      await expect(apiGet('/players')).rejects.toBeInstanceOf(ApiError)
    })
  })
})
