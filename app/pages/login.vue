<template>
  <div class="auth-container">
    <a-card class="auth-card" :bordered="false">
      <div class="auth-header">
        <h1 class="brand-title">E-Ticket</h1>
        <p class="auth-subtitle">Welcome back! Please login to your account.</p>
      </div>
      
      <a-form layout="vertical" @finish="handleLogin">
        <a-form-item label="Email Address" name="email" :rules="[{ required: true, type: 'email', message: 'Please input a valid email!' }]">
          <a-input v-model:value="form.email" placeholder="example@domain.com" size="large">
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item label="Password" name="password" :rules="[{ required: true, message: 'Please input your password!' }]">
          <a-input-password v-model:value="form.password" placeholder="Password" size="large">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-button type="primary" html-type="submit" block size="large" :loading="loading">
          Sign In
        </a-button>
        
        <div class="auth-footer">
          Don't have an account? <NuxtLink to="/register">Create one here</NuxtLink>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
const form = ref({ email: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  // Login logic here
  loading.value = false
}
</script>