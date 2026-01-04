export const useApi = () => {
  const config = useRuntimeConfig()
  
  return {
      // สร้างฟังก์ชัน fetch ที่ใส่ baseURL ให้อัตโนมัติ
      fetch: (url: string, options: any = {}) => {
          return $fetch(url, {
              baseURL: config.public.apiBase,
              ...options
          })
      }
  }
}