// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const { isLoggedIn, user } = storeToRefs(authStore)

  // 1. กำหนดกลุ่ม Path ที่ต้องการป้องกัน
  const isAdminPath = to.path.startsWith('/admin')
  const isStaffPath = to.path.startsWith('/staff')

  // 2. ถ้าเป็นหน้า Admin หรือ Staff ให้เช็คสิทธิ์
  if (isAdminPath || isStaffPath) {
    // เช็คว่าล็อกอินหรือยัง
    if (!isLoggedIn.value) {
      return navigateTo('/login')
    }

    // เช็ค Role (Owner เข้าได้หมด, Staff เข้าได้แค่หน้า staff)
    const allowedRoles = ['owner', 'staff']
    if (!allowedRoles.includes(user.value.role)) {
      return navigateTo('/')
    }
  }
})