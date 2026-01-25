export const useAuthStore = defineStore('auth', () => {
    // 1. State
    const user = ref<{ email: string; role: string } | null>(null)

    // 2. ใช้ useCookie ของ Nuxt โดยตรงเพื่อเก็บ Token
    // ตั้งค่าให้ Token อยู่ได้ 7 วัน และเข้าถึงได้ทั่วทั้งไซต์
    const tokenCookie = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    const token = ref<string | null>(tokenCookie.value || null)

    // 3. Computed
    const isLoggedIn = computed(() => !!token.value)

    // 4. Actions
    const setAuth = (userData: { email: string; role: string }, userToken: string) => {
        user.value = userData
        token.value = userToken
        tokenCookie.value = userToken // บันทึกลง Cookie ทันที
    }

    const clearAuth = () => {
        user.value = null
        token.value = null
        tokenCookie.value = null // ลบออกจาก Cookie
    }

    return { user, token, isLoggedIn, setAuth, clearAuth }
}, {
    // เก็บเฉพาะข้อมูล User ลงใน LocalStorage
    persist: {
        key: 'user_data',
        pick: ['user'] // เลือกเก็บเฉพาะ user, ส่วน token เราจัดการแยกผ่าน Cookie แล้ว
    }
})