import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    // 1. กำหนด Cookie สำหรับ User และ Token
    const userCookie = useCookie<{ email: string; role: string } | null>('user_data', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })
    const tokenCookie = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    // 2. State: ใช้ค่าจาก Cookie มาตั้งต้น
    const user = ref(userCookie.value || null)
    const token = ref(tokenCookie.value || null)

    // 3. Computed: ตรวจสอบสถานะการ Login
    const isLoggedIn = computed(() => !!token.value)

    // 4. Actions: อัปเดตทั้ง State และ Cookie พร้อมกันเพื่อให้ UI เปลี่ยนทันที
    const setAuth = (userData: { email: string; role: string }, userToken: string) => {
        user.value = userData
        token.value = userToken
        
        userCookie.value = userData
        tokenCookie.value = userToken
    }

    const clearAuth = () => {
        user.value = null
        token.value = null
        userCookie.value = null
        tokenCookie.value = null
    }

    return { user, token, isLoggedIn, setAuth, clearAuth }
})