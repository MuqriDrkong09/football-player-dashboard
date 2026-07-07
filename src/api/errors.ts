import type { AxiosError } from 'axios'
import type { ApiFootballErrors } from '@/types/api-football'

export type ApiErrorCode =
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode?: number
  readonly apiErrors?: ApiFootballErrors
  readonly originalError?: unknown

  constructor(
    message: string,
    options: {
      code?: ApiErrorCode
      statusCode?: number
      apiErrors?: ApiFootballErrors
      originalError?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code ?? 'UNKNOWN'
    this.statusCode = options.statusCode
    this.apiErrors = options.apiErrors
    this.originalError = options.originalError
  }

  static fromApiErrors(
    errors: ApiFootballErrors,
    statusCode?: number,
  ): ApiError {
    const message = formatApiErrors(errors)
    const code = inferCodeFromMessage(message, statusCode)

    return new ApiError(message, {
      code,
      statusCode,
      apiErrors: errors,
    })
  }

  static fromAxiosError(error: AxiosError): ApiError {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('Request timed out. Please try again.', {
        code: 'TIMEOUT',
        originalError: error,
      })
    }

    if (!error.response) {
      return new ApiError(
        'Network error. Check your connection and try again.',
        {
          code: 'NETWORK_ERROR',
          originalError: error,
        },
      )
    }

    const { status, data } = error.response
    const apiErrors = extractApiErrors(data)

    if (apiErrors) {
      return ApiError.fromApiErrors(apiErrors, status)
    }

    const message = getHttpErrorMessage(status)

    return new ApiError(message, {
      code: mapStatusToCode(status),
      statusCode: status,
      originalError: error,
    })
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) return error

    if (isAxiosError(error)) {
      return ApiError.fromAxiosError(error)
    }

    if (error instanceof Error) {
      return new ApiError(error.message, {
        code: 'UNKNOWN',
        originalError: error,
      })
    }

    return new ApiError('An unexpected error occurred.', {
      code: 'UNKNOWN',
      originalError: error,
    })
  }
}

function formatApiErrors(errors: ApiFootballErrors): string {
  if (Array.isArray(errors)) {
    return errors.join(', ') || 'API request failed.'
  }

  const messages = Object.entries(errors).map(
    ([key, value]) => `${key}: ${value}`,
  )

  return messages.join('; ') || 'API request failed.'
}

function extractApiErrors(data: unknown): ApiFootballErrors | null {
  if (!data || typeof data !== 'object') return null

  const errors = (data as { errors?: ApiFootballErrors }).errors
  if (!errors) return null

  if (Array.isArray(errors)) {
    return errors.length > 0 ? errors : null
  }

  return Object.keys(errors).length > 0 ? errors : null
}

function inferCodeFromMessage(
  message: string,
  statusCode?: number,
): ApiErrorCode {
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('request limit')) {
    return 'RATE_LIMIT'
  }

  if (
    lower.includes('token') ||
    lower.includes('key') ||
    lower.includes('auth')
  ) {
    return 'UNAUTHORIZED'
  }

  return mapStatusToCode(statusCode)
}

function mapStatusToCode(status?: number): ApiErrorCode {
  if (!status) return 'UNKNOWN'
  if (status === 401 || status === 403) return 'UNAUTHORIZED'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMIT'
  return 'API_ERROR'
}

function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request parameters.'
    case 401:
    case 403:
      return 'Invalid or missing API key.'
    case 404:
      return 'The requested resource was not found.'
    case 429:
      return 'API rate limit exceeded. Please try again later.'
    case 500:
    case 502:
    case 503:
      return 'API service is temporarily unavailable.'
    default:
      return `Request failed with status ${status}.`
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}
