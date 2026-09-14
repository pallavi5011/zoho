import responses from '@/mocks/responses.json'

/** Envelope every backend endpoint returns. */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'
const MOCK_DELAY_MS = 150

const mockResponses = responses as Record<string, ApiResponse<unknown>>

/** Looks up "METHOD /path" (query string ignored) in responses.json. */
async function mockRequest(method: string, path: string): Promise<ApiResponse<unknown>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  const key = `${method} ${path.split('?')[0]}`
  return mockResponses[key] ?? { success: false, message: `No mock response for ${key}`, data: null }
}

async function httpRequest(method: string, path: string): Promise<ApiResponse<unknown>> {
  const res = await fetch(`${BASE_URL}${path}`, { method, headers: { Accept: 'application/json' } })
  return res.json()
}

export async function apiGet<T>(path: string): Promise<T> {
  const body = USE_MOCKS ? await mockRequest('GET', path) : await httpRequest('GET', path)
  if (!body.success) throw new Error(body.message)
  return body.data as T
}
