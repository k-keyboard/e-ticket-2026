<template>
    <div class="auth-container">
        <a-card class="auth-card" :bordered="false">
            <div class="auth-header">
                <h1 class="brand-title">Reset Password</h1>
                <p class="auth-subtitle">Enter your email to receive a password reset link.</p>
            </div>

            <a-form :model="form" layout="vertical" @finish="handleForgotPassword">
                <a-form-item
                    label="Email Address"
                    name="email"
                    :rules="[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]"
                >
                    <a-input v-model:value="form.email" placeholder="example@domain.com" size="large">
                        <template #prefix><MailOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading">
                    Send Reset Link
                </a-button>

                <div class="auth-footer">Remembered your password? <NuxtLink to="/login">Back to Login</NuxtLink></div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { MailOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const form = reactive({ email: '' })
const loading = ref(false)
const api = useApi()

const handleForgotPassword = async () => {
    loading.value = true
    try {
        await api.fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: form.email },
        })
        message.success('If this email exists, a reset link has been sent.')
        form.email = '' // ล้างค่าหลังส่งสำเร็จ
    } catch (err) {
        message.error(err.data?.statusMessage || 'Something went wrong')
    } finally {
        loading.value = false
    }
}
</script>
