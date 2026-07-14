import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ApiError } from '@/api/errors'
import { setupInterceptors } from '@/api/interceptors'

type RequestHandler = {
  onFulfilled?: (config: InternalAxiosRequestConfig) => unknown
  onRejected?: (error: unknown) => unknown
}

type ResponseHandler = {
  onFulfilled?: (response: AxiosResponse) => unknown
  onRejected?: (error: unknown) => unknown
}

function createMockClient() {
  const requestHandlers: RequestHandler[] = []
  const responseHandlers: ResponseHandler[] = []

  const client = {
    interceptors: {
      request: {
        use(
          onFulfilled?: (config: InternalAxiosRequestConfig) => unknown,
          onRejected?: (error: unknown) => unknown,
        ) {
          requestHandlers.push({ onFulfilled, onRejected })
        },
      },
      response: {
        use(
          onFulfilled?: (response: AxiosResponse) => unknown,
          onRejected?: (error: unknown) => unknown,
        ) {
          responseHandlers.push({ onFulfilled, onRejected })
        },
      },
    },
  } as unknown as AxiosInstance

  setupInterceptors(client)

  return { requestHandlers, responseHandlers }
}

function createResponse(
  partial: Partial<AxiosResponse> & { data?: unknown },
): AxiosResponse {
  return {
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    ...partial,
  } as AxiosResponse
}

describe('api/interceptors', () => {
  describe('setupInterceptors', () => {
    it('registers request and response handlers', () => {
      const { requestHandlers, responseHandlers } = createMockClient()

      expect(requestHandlers).toHaveLength(1)
      expect(responseHandlers).toHaveLength(1)
      expect(requestHandlers[0].onFulfilled).toEqual(expect.any(Function))
      expect(requestHandlers[0].onRejected).toEqual(expect.any(Function))
      expect(responseHandlers[0].onFulfilled).toEqual(expect.any(Function))
      expect(responseHandlers[0].onRejected).toEqual(expect.any(Function))
    })
  })

  describe('attachApiKey', () => {
    it('sets the API sports key header on outgoing requests', () => {
      const { requestHandlers } = createMockClient()
      const headers = new Map<string, string>()
      const config = {
        headers: {
          set: (key: string, value: string) => {
            headers.set(key, value)
          },
        },
      } as unknown as InternalAxiosRequestConfig

      const next = requestHandlers[0].onFulfilled?.(
        config,
      ) as InternalAxiosRequestConfig

      expect(next).toBe(config)
      expect(headers.get('x-apisports-key')).toBe('test-api-key')
    })
  })

  describe('validateApiResponse', () => {
    it('passes through responses with no errors field', () => {
      const { responseHandlers } = createMockClient()
      const response = createResponse({
        data: { response: [{ id: 1 }] },
      })

      expect(responseHandlers[0].onFulfilled?.(response)).toBe(response)
    })

    it('passes through responses when data is missing', () => {
      const { responseHandlers } = createMockClient()
      const response = createResponse({ data: undefined })

      expect(responseHandlers[0].onFulfilled?.(response)).toBe(response)
    })

    it('passes through responses with empty array or object errors', () => {
      const { responseHandlers } = createMockClient()

      const emptyArray = createResponse({
        data: { errors: [], response: [] },
      })
      const emptyObject = createResponse({
        data: { errors: {}, response: [] },
      })

      expect(responseHandlers[0].onFulfilled?.(emptyArray)).toBe(emptyArray)
      expect(responseHandlers[0].onFulfilled?.(emptyObject)).toBe(emptyObject)
    })

    it('throws ApiError for non-empty array payload errors', () => {
      const { responseHandlers } = createMockClient()
      const response = createResponse({
        status: 200,
        data: {
          errors: ['plan: request limit'],
          response: [],
        },
      })

      expect(() => responseHandlers[0].onFulfilled?.(response)).toThrow(
        ApiError,
      )
      expect(() => responseHandlers[0].onFulfilled?.(response)).toThrow(
        /request limit/i,
      )
    })

    it('throws ApiError for non-empty object payload errors', () => {
      const { responseHandlers } = createMockClient()
      const response = createResponse({
        status: 400,
        data: {
          errors: { token: 'missing' },
          response: [],
        },
      })

      try {
        responseHandlers[0].onFulfilled?.(response)
        throw new Error('expected throw')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({
          code: 'UNAUTHORIZED',
          statusCode: 400,
          message: 'token: missing',
        })
      }
    })
  })

  describe('handleResponseError', () => {
    it('normalizes request interceptor rejections into ApiError', async () => {
      const { requestHandlers } = createMockClient()

      await expect(
        requestHandlers[0].onRejected?.(new Error('request failed')),
      ).rejects.toMatchObject({
        name: 'ApiError',
        message: 'request failed',
        code: 'UNKNOWN',
      })
    })

    it('normalizes response interceptor rejections into ApiError', async () => {
      const { responseHandlers } = createMockClient()
      const existing = new ApiError('Already normalized', {
        code: 'NETWORK_ERROR',
      })

      await expect(responseHandlers[0].onRejected?.(existing)).rejects.toBe(
        existing,
      )
    })

    it('normalizes unknown rejection values', async () => {
      const { responseHandlers } = createMockClient()

      await expect(responseHandlers[0].onRejected?.('boom')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred.',
        code: 'UNKNOWN',
        originalError: 'boom',
      })
    })
  })
})
