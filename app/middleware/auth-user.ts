// middleware/auth-user.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore() // หรือใช้ Token จาก Cookie/LocalStorage
    const { isLoggedIn } = storeToRefs(authStore)

    // ถ้ายังไม่ได้ล็อกอิน และกำลังจะเข้าหน้าที่มี middleware นี้
    if (!isLoggedIn.value) {
        return navigateTo('/login')
    }
})