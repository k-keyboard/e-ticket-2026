import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  const setAuth = (userData: any, userToken: any) => {
      user.value = userData
      token.value = userToken
  }

  const logout = () => {
      user.value = null
      token.value = null
      navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!token.value)

  return { user, token, setAuth, logout, isAuthenticated }
}, 
{
  persist: true 
})