// composables/useApi.ts
import type { FetchResponse } from 'ofetch' // Import type เข้ามา

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
              // ระบุ Type ให้กับ { response }
              async onResponseError({ response }: { response: FetchResponse<any> }) {
                  if (response.status === 401) {
                      console.error('Session expired')
                      // คุณอาจจะเพิ่มการ clear cookie ตรงนี้ถ้าต้องการ
                  }
              }
          })
      }
  }
}