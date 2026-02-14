<template>
    <div class="auth-wrapper">
        <NuxtLink to="/login" class="back-home"> <ArrowLeftOutlined /> Back to Login </NuxtLink>

        <a-card class="auth-card" :bordered="false">
            <div class="auth-header">
                <div class="logo-circle">
                    <span class="logo-text">YP</span>
                </div>
                <h1 class="brand-title">RESET <span class="gold-text">KEY</span></h1>
                <p class="auth-subtitle">Enter your email to receive a password reset link</p>
            </div>

            <a-form :model="form" layout="vertical" @finish="handleForgotPassword">
                <a-form-item
                    label="Email Address"
                    name="email"
                    class="custom-item"
                    :rules="[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]"
                >
                    <a-input v-model:value.trim="form.email" placeholder="yourname@domain.com" size="large">
                        <template #prefix><MailOutlined class="prefix-icon" /></template>
                    </a-input>
                </a-form-item>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading" class="login-button">
                    SEND RESET LINK
                </a-button>

                <div class="auth-footer">
                    Remembered your password? <NuxtLink to="/login" class="gold-link">Back to Login</NuxtLink>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// ใช้ Layout เปล่าเหมือนหน้า Login
definePageMeta({
    layout: 'blank',
})

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
        form.email = ''
    } catch (err) {
        message.error(err.data?.statusMessage || 'Something went wrong')
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
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
    transition: 0.3s;
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
        letter-spacing: 2px;
        .gold-text {
            color: $color-gold;
        }
    }
    .auth-subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
        margin-top: 8px;
    }
}

.login-button {
    height: 50px;
    font-size: 0.9rem;
    font-weight: 800;
    border-radius: 10px;
    background: $color-gold;
    border: none;
    color: $color-night;
    margin-top: 10px;
    letter-spacing: 1px;
    &:hover {
        background: #fff !important;
        color: $color-gold !important;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba($color-gold, 0.3);
    }
}

.auth-footer {
    text-align: center;
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    .gold-link {
        color: $color-gold;
        font-weight: 600;
        margin-left: 5px;
    }
}

// Custom Ant Design Styles
:deep(.ant-form-item-label > label) {
    color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.ant-input-affix-wrapper) {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
    padding: 10px 15px;

    input {
        background: transparent !important;
        color: #fff !important;
        &::placeholder {
            color: rgba(255, 255, 255, 0.3) !important;
        }
    }

    .prefix-icon {
        color: $color-gold !important;
        margin-right: 8px;
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
