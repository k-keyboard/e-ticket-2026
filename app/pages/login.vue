<template>
    <div class="auth-container">
        <a-card class="auth-card" :bordered="false">
            <div class="auth-header">
                <h1 class="brand-title">E-Ticket</h1>
                <p class="auth-subtitle">Welcome back! Please login to your account.</p>
            </div>

            <a-form :model="form" layout="vertical" @finish="handleLogin">
                <a-form-item
                    label="Email Address"
                    name="email"
                    :rules="[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]"
                >
                    <a-input v-model:value="form.email" placeholder="example@domain.com" size="large">
                        <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input>
                </a-form-item>

                <a-form-item
                    label="Password"
                    name="password"
                    :rules="[{ required: true, message: 'Please input your password!' }]"
                >
                    <a-input-password v-model:value="form.password" placeholder="Password" size="large">
                        <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    </a-input-password>
                </a-form-item>

                <div class="auth-options">
                    <a-checkbox v-model:checked="form.remember">Remember me</a-checkbox>
                    <NuxtLink to="/forgot-password" class="forgot-link">Forgot password?</NuxtLink>
                </div>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading" class="login-button">
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
import { message } from 'ant-design-vue'

const form = reactive({
    email: '',
    password: '',
    remember: true,
})

const loading = ref(false)
const api = useApi()
const authStore = useAuthStore()

const handleLogin = async () => {
    loading.value = true
    try {
        const response = await api.fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: form.email,
                password: form.password,
            },
        })

        // บันทึกข้อมูลลง Store (ซึ่งจะถูกบันทึกลง Cookie โดยอัตโนมัติ)
        authStore.setAuth(response.user, response.token || 'dummy-session-token')

        message.success('Login successful! Redirecting...')

        setTimeout(() => {
            navigateTo('/')
        }, 1000)
    } catch (err) {
        const errorMsg = err.data?.statusMessage || 'Invalid email or password'
        message.error(errorMsg)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* background-color: #f0f2f5; */
    padding: 20px;
}

.auth-card {
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
}

.auth-header {
    text-align: center;
    margin-bottom: 24px;
}

.brand-title {
    font-size: 28px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 0;
}

.auth-subtitle {
    color: #8c8c8c;
}

.auth-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.forgot-link {
    font-size: 14px;
}

.login-button {
    height: 45px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
}

.auth-footer {
    text-align: center;
    margin-top: 24px;
    color: #666;
    font-size: 14px;
}
</style>
