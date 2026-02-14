import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const userCookie = useCookie('user_data', { maxAge: 60 * 60 * 24 * 7, path: '/' })
    const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7, path: '/' })

    const user: any = ref(userCookie.value || null)
    const token: any = ref(tokenCookie.value || null)

    const isLoggedIn = computed(() => !!token.value)

    // บังคับให้ ref เปลี่ยนตาม cookie ทันที
    watch(userCookie, (newVal) => { user.value = newVal }, { deep: true })
    watch(tokenCookie, (newVal) => { token.value = newVal })

    const setAuth = (userData: string | null | undefined, userToken: string | null | undefined) => {
        userCookie.value = userData
        tokenCookie.value = userToken
        user.value = userData
        token.value = userToken
    }

    const clearAuth = () => {
        userCookie.value = null
        tokenCookie.value = null
        user.value = null
        token.value = null
    }

    return { user, token, isLoggedIn, setAuth, clearAuth }
})