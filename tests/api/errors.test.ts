import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ApiError, getErrorMessage, isApiError } from '@/api/errors'

function createAxiosError(
  partial: Partial<AxiosError> & { response?: Partial<AxiosResponse> | null } = {},
): AxiosError {
  const error = new AxiosError(partial.message ?? 'Request failed')
  error.isAxiosError = true
  error.code = partial.code
  error.response =
    partial.response === null
      ? undefined
      : partial.response
        ? ({
            status: 500,
            statusText: 'Error',
            headers: {},
            config: {} as InternalAxiosRequestConfig,
            data: {},
            ...partial.response,
          } as AxiosResponse)
        : undefined
  return error
}

describe('api/errors', () => {
  describe('ApiError constructor', () => {
    it('applies defaults and optional metadata', () => {
      const plain = new ApiError('Boom')
      expect(plain).toMatchObject({
        name: 'ApiError',
        message: 'Boom',
        code: 'UNKNOWN',
      })
      expect(isApiError(plain)).toBe(true)
      expect(isApiError(new Error('nope'))).toBe(false)

      const detailed = new ApiError('Denied', {
        code: 'UNAUTHORIZED',
        statusCode: 401,
        apiErrors: { token: 'invalid' },
        originalError: new Error('root'),
      })

      expect(detailed).toMatchObject({
        code: 'UNAUTHORIZED',
        statusCode: 401,
        apiErrors: { token: 'invalid' },
      })
      expect(detailed.originalError).toBeInstanceOf(Error)
    })
  })

  describe('fromApiErrors', () => {
    it('formats array errors and infers RATE_LIMIT from the message', () => {
      expect(ApiError.fromApiErrors(['Rate limit reached'])).toMatchObject({
        message: 'Rate limit reached',
        code: 'RATE_LIMIT',
      })
      expect(
        ApiError.fromApiErrors(['request limit exceeded'], 400),
      ).toMatchObject({
        code: 'RATE_LIMIT',
        statusCode: 400,
      })
    })

    it('formats object errors and infers UNAUTHORIZED keywords', () => {
      expect(ApiError.fromApiErrors({ token: 'missing' }, 401)).toMatchObject({
        message: 'token: missing',
        code: 'UNAUTHORIZED',
      })
      expect(ApiError.fromApiErrors({ key: 'invalid' }).code).toBe(
        'UNAUTHORIZED',
      )
      expect(ApiError.fromApiErrors({ auth: 'required' }).code).toBe(
        'UNAUTHORIZED',
      )
    })

    it('falls back to status-based codes when the message has no keywords', () => {
      expect(ApiError.fromApiErrors(['Something failed'], 404).code).toBe(
        'NOT_FOUND',
      )
      expect(ApiError.fromApiErrors(['Something failed']).code).toBe('UNKNOWN')
      expect(ApiError.fromApiErrors(['Something failed'], 500).code).toBe(
        'API_ERROR',
      )
    })

    it('uses fallback messages for empty array/object payloads', () => {
      expect(ApiError.fromApiErrors([]).message).toBe('API request failed.')
      expect(ApiError.fromApiErrors({}).message).toBe('API request failed.')
    })
  })

  describe('fromAxiosError', () => {
    it('maps timeout and network failures', () => {
      expect(
        ApiError.fromAxiosError(createAxiosError({ code: 'ECONNABORTED' })),
      ).toMatchObject({
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
      })

      expect(ApiError.fromAxiosError(createAxiosError({}))).toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Network error. Check your connection and try again.',
      })
    })

    it('uses API payload errors when present', () => {
      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: {
              status: 429,
              data: { errors: { plan: 'request limit exceeded' } },
            },
          }),
        ).code,
      ).toBe('RATE_LIMIT')

      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: {
              status: 400,
              data: { errors: ['bad plan'] },
            },
          }),
        ).message,
      ).toBe('bad plan')
    })

    it('ignores empty API error payloads and uses HTTP status messages', () => {
      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: { status: 400, data: { errors: [] } },
          }),
        ),
      ).toMatchObject({
        code: 'API_ERROR',
        message: 'Invalid request parameters.',
      })

      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: { status: 403, data: { errors: {} } },
          }),
        ),
      ).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key.',
      })

      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: { status: 401, data: null },
          }),
        ),
      ).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key.',
      })

      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: { status: 404, data: 'not-an-object' },
          }),
        ),
      ).toMatchObject({
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      })

      expect(
        ApiError.fromAxiosError(
          createAxiosError({
            response: { status: 429, data: {} },
          }),
        ),
      ).toMatchObject({
        code: 'RATE_LIMIT',
        message: 'API rate limit exceeded. Please try again later.',
      })
    })

    it('maps server and unknown HTTP statuses', () => {
      for (const status of [500, 502, 503]) {
        expect(
          ApiError.fromAxiosError(
            createAxiosError({ response: { status, data: {} } }),
          ),
        ).toMatchObject({
          code: 'API_ERROR',
          message: 'API service is temporarily unavailable.',
        })
      }

      expect(
        ApiError.fromAxiosError(
          createAxiosError({ response: { status: 418, data: {} } }),
        ),
      ).toMatchObject({
        code: 'API_ERROR',
        message: 'Request failed with status 418.',
      })
    })
  })

  describe('fromUnknown', () => {
    it('returns existing ApiError instances as-is', () => {
      const existing = new ApiError('Existing', { code: 'API_ERROR' })
      expect(ApiError.fromUnknown(existing)).toBe(existing)
    })

    it('delegates Axios errors through fromAxiosError', () => {
      const axiosError = createAxiosError({ code: 'ECONNABORTED' })
      expect(ApiError.fromUnknown(axiosError)).toMatchObject({
        code: 'TIMEOUT',
      })
    })

    it('wraps generic Error and non-error values', () => {
      expect(ApiError.fromUnknown(new Error('plain')).message).toBe('plain')
      expect(ApiError.fromUnknown('weird')).toMatchObject({
        message: 'An unexpected error occurred.',
        code: 'UNKNOWN',
        originalError: 'weird',
      })
    })

    it('ignores objects that look like Axios errors but are not', () => {
      expect(
        ApiError.fromUnknown({ isAxiosError: false, message: 'nope' }),
      ).toMatchObject({
        message: 'An unexpected error occurred.',
        code: 'UNKNOWN',
      })
    })
  })

  describe('getErrorMessage', () => {
    it('reads messages from ApiError, Error, and unknown values', () => {
      expect(getErrorMessage(new ApiError('Existing'))).toBe('Existing')
      expect(getErrorMessage(new Error('x'))).toBe('x')
      expect(getErrorMessage(null)).toBe('An unexpected error occurred.')
    })
  })
})
