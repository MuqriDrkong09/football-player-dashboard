import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { apiConfig, assertApiKey } from '@/api/config'
import { ApiError } from '@/api/errors'
import type {
  ApiFootballErrors,
  ApiFootballResponse,
} from '@/types/api-football'

function attachApiKey(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  assertApiKey()

  config.headers.set('x-apisports-key', apiConfig.apiKey)

  return config
}

function validateApiResponse<T>(
  response: AxiosResponse<ApiFootballResponse<T>>,
): AxiosResponse<ApiFootballResponse<T>> {
  const { data } = response
  const errors = data?.errors

  if (!errors) return response

  const hasErrors = Array.isArray(errors)
    ? errors.length > 0
    : Object.keys(errors).length > 0

  if (hasErrors) {
    throw ApiError.fromApiErrors(errors as ApiFootballErrors, response.status)
  }

  return response
}

function handleResponseError(error: unknown): Promise<never> {
  return Promise.reject(ApiError.fromUnknown(error))
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(attachApiKey, handleResponseError)
  client.interceptors.response.use(validateApiResponse, handleResponseError)
}
