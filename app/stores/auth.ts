import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => !!token.value)

    const setAuth = (userData: any, userToken: string) => {
        user.value = userData
        token.value = userToken
    }

    const clearAuth = () => {
        user.value = null
        token.value = null
    }

    return { user, token, isLoggedIn, setAuth, clearAuth }
}, {
    persist: {
        key: 'auth_session',
        storage: {
            // แก้ไขตรงนี้: บังคับคืนค่าเป็น string | null เท่านั้น
            getItem: (key: string): string | null => {
                const data = useCookie(key).value
                // ถ้า data เป็น null หรือ undefined ให้ส่งกลับเป็น null
                if (data === null || data === undefined) return null

                // ถ้า data เป็น object (กรณี Nuxt auto-parse) ให้แปลงเป็น string
                if (typeof data === 'object') return JSON.stringify(data)

                return data as string
            },
            setItem: (key: string, value: string) => {
                useCookie(key, {
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/',
                    sameSite: 'lax'
                }).value = value
            }
        }
    },
})