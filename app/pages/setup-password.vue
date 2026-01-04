<template>
  <div class="auth-container">
    <a-card class="auth-card" :bordered="false" :loading="verifying">
      <div v-if="validToken">
        <div class="auth-header">
          <h1 class="brand-title">Set Password</h1>
          <p class="auth-subtitle">Setting up account for: <strong>{{ email }}</strong></p>
        </div>

        <a-form layout="vertical" @finish="handleSetup">
          <a-form-item label="New Password" name="password" :rules="[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]">
            <a-input-password v-model:value="form.password" placeholder="Min. 6 characters" size="large" />
          </a-form-item>

          <a-form-item label="Confirm Password" name="confirm" :rules="[{ required: true, message: 'Please confirm your password' }]">
            <a-input-password v-model:value="form.confirm" placeholder="Confirm your password" size="large" />
          </a-form-item>

          <a-button type="primary" html-type="submit" block size="large" :loading="loading">
            Complete Registration
          </a-button>
        </a-form>
      </div>
      
      <a-result v-else status="error" title="Invalid or Expired Link" sub-title="This invitation link is no longer valid. Please request a new one.">
        <template #extra>
          <a-button type="primary" @click="navigateTo('/register')">Request New Link</a-button>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue'
const route = useRoute()
const token = route.query.token
const email = ref('')
const validToken = ref(false)
const verifying = ref(true)
const loading = ref(false)
const form = ref({ password: '', confirm: '' })

onMounted(async () => {
  if (!token) {
    validToken.value = false
    verifying.value = false
    return
  }
  try {
    const data = await $fetch('/api/auth/verify-token', { query: { token } })
    email.value = data.email
    validToken.value = true
  } catch (err) {
    validToken.value = false
  } finally {
    verifying.value = false
  }
})

const handleSetup = async () => {
  if (form.value.password !== form.value.confirm) {
    return message.error('Passwords do not match!')
  }
  loading.value = true
  try {
    await $fetch('/api/auth/setup-password', {
      method: 'POST',
      body: { token, password: form.value.password }
    })
    message.success('Password set successfully! Redirecting to login...')
    setTimeout(() => navigateTo('/login'), 2000)
  } catch (err) {
    message.error('Failed to update password. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>