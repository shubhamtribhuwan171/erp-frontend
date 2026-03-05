export type AdminErrorShape = {
  success?: boolean
  message?: string
  error?: string
}

export function getAdminErrorMessage(error: unknown): string {
  // NOTE: admin-api interceptor rejects with `error.response?.data || error`
  // so most of the time this will already be the API JSON shape.
  const e = error as any
  return (
    e?.message ||
    e?.error ||
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.response?.data?.data?.message ||
    e?.response?.data?.data?.error ||
    'Something went wrong'
  )
}

export function isAdminForbidden(error: unknown): boolean {
  const e = error as any
  return e?.status === 403 || e?.response?.status === 403
}
