<script setup>
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

definePageMeta({
    layout: 'blank',
})

const form = reactive({
    email: '',
    password: '',
    remember: true, // เพิ่มกลับมา
})

const loading = ref(false)
const api = useApi()
const authStore = useAuthStore()

const handleLogin = async () => {
    if (!form.email || !form.password) {
        return message.warning('Please enter both email and password')
    }

    loading.value = true
    try {
        const response = await api.fetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: form.email,
                password: form.password,
            },
        })

        authStore.setAuth(response.user, response.token)
        message.success('Login successful!')
        await navigateTo('/')
    } catch (err) {
        const errorMsg = err.data?.statusMessage || 'Invalid email or password'
        message.error(errorMsg)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-wrapper">
        <NuxtLink to="/" class="back-home"> <ArrowLeftOutlined /> Back to Home </NuxtLink>

        <a-card class="auth-card" :bordered="false">
            <div class="auth-header">
                <div class="logo-circle">
                    <span class="logo-text">YP</span>
                </div>
                <h1 class="brand-title">YI PENG <span class="gold-text">2026</span></h1>
                <p class="auth-subtitle">Sign in to your account</p>
            </div>

            <a-form :model="form" layout="vertical" @finish="handleLogin">
                <a-form-item label="Email Address" class="custom-item">
                    <a-input v-model:value="form.email" placeholder="your@email.com" size="large">
                        <template #prefix><UserOutlined class="prefix-icon" /></template>
                    </a-input>
                </a-form-item>

                <a-form-item label="Password" class="custom-item">
                    <a-input-password v-model:value="form.password" placeholder="••••••••" size="large">
                        <template #prefix><LockOutlined class="prefix-icon" /></template>
                    </a-input-password>
                </a-form-item>

                <div class="auth-options">
                    <a-checkbox v-model:checked="form.remember" class="custom-checkbox">Remember me</a-checkbox>
                    <NuxtLink to="/forgot-password" class="gold-link">Forgot password?</NuxtLink>
                </div>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading" class="login-button">
                    SIGN IN
                </a-button>

                <div class="auth-footer">
                    Don't have an account? <NuxtLink to="/register" class="gold-link">Register</NuxtLink>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<style lang="scss" scoped>
/* --- สไตล์เดิมคงไว้ทั้งหมด เพิ่มเติมส่วนที่ขาด --- */

.auth-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
    padding: 20px;
    position: relative;
}

.back-home {
    position: absolute;
    top: 20px;
    left: 20px;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    &:hover {
        color: $color-gold;
    }
}

.auth-card {
    width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba($color-gold, 0.2);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.auth-header {
    text-align: center;
    margin-bottom: 24px;
    .logo-circle {
        width: 50px;
        height: 50px;
        background: $color-gold;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 12px;
        .logo-text {
            font-weight: 900;
            color: $color-night;
        }
    }
    .brand-title {
        font-size: 22px;
        font-weight: 800;
        color: #fff;
        margin: 0;
        .gold-text {
            color: $color-gold;
        }
    }
    .auth-subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
    }
}

/* เพิ่มสไตล์สำหรับ Options */
.auth-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 0.85rem;
}

.login-button {
    height: 50px;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 10px;
    background: $color-gold;
    border: none;
    color: $color-night;
    &:hover {
        background: #fff !important;
        color: $color-gold !important;
    }
}

.auth-footer {
    text-align: center;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.4);
}

.gold-link {
    color: $color-gold;
    font-weight: 600;
    &:hover {
        text-decoration: underline;
    }
}

/* ปรับแต่ง Checkbox ให้เข้ากับธีมมืด */
.custom-checkbox {
    color: rgba(255, 255, 255, 0.6) !important;
    &:hover {
        color: $color-gold !important;
    }
    :deep(.ant-checkbox-inner) {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba($color-gold, 0.3);
    }
    :deep(.ant-checkbox-checked .ant-checkbox-inner) {
        background-color: $color-gold;
        border-color: $color-gold;
    }
}

/* --- ส่วน Input Styles เหมือนเดิม --- */
:deep(.ant-form-item-label > label) {
    color: rgba(255, 255, 255, 0.8) !important;
}
:deep(.ant-input-affix-wrapper) {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
    padding: 8px 12px;
    input {
        background: transparent !important;
        color: #fff !important;
        &::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
        }
    }
    .prefix-icon,
    .ant-input-password-icon {
        color: $color-gold !important;
    }
    &:hover {
        border-color: $color-gold !important;
    }
}
:deep(.ant-input-affix-wrapper-focused) {
    border-color: $color-gold !important;
    box-shadow: 0 0 0 2px rgba($color-gold, 0.1) !important;
}
</style>
