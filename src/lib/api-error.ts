import type { AxiosError } from 'axios'

export type ApiErrorShape = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

export function getApiErrorMessage(error: unknown): string {
  const e = error as AxiosError<ApiErrorShape>
  const msg = e?.response?.data?.message
  if (msg) return msg
  return e?.message || 'Something went wrong'
}

export function isModuleDisabledError(error: unknown): boolean {
  const msg = getApiErrorMessage(error)
  return msg.toLowerCase().includes('module disabled')
}

export function isForbidden(error: unknown): boolean {
  const e = error as AxiosError
  return e?.response?.status === 403
}
