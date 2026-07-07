import axios, { type AxiosRequestConfig } from 'axios'
import { apiConfig } from '@/api/config'
import { ApiError } from '@/api/errors'
import { setupInterceptors } from '@/api/interceptors'
import type { ApiFootballResponse, PaginatedResult } from '@/types/api-football'

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

setupInterceptors(apiClient)

async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<ApiFootballResponse<T>> {
  try {
    const { data } = await apiClient.request<ApiFootballResponse<T>>(config)
    return data
  } catch (error) {
    throw ApiError.fromUnknown(error)
  }
}

async function apiGet<T>(
  url: string,
  params?: object,
): Promise<PaginatedResult<T>> {
  const response = await apiRequest<T>({ method: 'GET', url, params })

  return {
    data: response.response,
    results: response.results,
    paging: response.paging,
  }
}

export { apiClient, apiGet, apiRequest }
