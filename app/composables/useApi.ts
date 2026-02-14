// composables/useApi.ts
import type { FetchResponse } from 'ofetch'

export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  
  return {
      fetch: (url: string, options: any = {}) => {
          return $fetch(url, {
              baseURL: config.public.apiBase || '',
              ...options,
              headers: {
                  ...options.headers,
                  Authorization: token.value ? `Bearer ${token.value}` : '',
              },
              async onResponseError({ response }: { response: FetchResponse<any> }) {
                  if (response.status === 401) {
                      console.error('Session expired')
                  }
              }
          })
      }
  }
}