<template>
    <div class="auth-wrapper">
        <NuxtLink to="/" class="back-home"> <ArrowLeftOutlined /> Back to Home </NuxtLink>

        <a-card class="auth-card" :bordered="false" :loading="verifying">
            <div v-if="validToken">
                <div class="auth-header">
                    <div class="logo-circle">
                        <span class="logo-text">YP</span>
                    </div>
                    <h1 class="brand-title">SET <span class="gold-text">PASSWORD</span></h1>
                    <p class="auth-subtitle">
                        Setting up account for: <br />
                        <strong class="gold-text">{{ email }}</strong>
                    </p>
                </div>

                <a-form :model="form" layout="vertical" @finish="handleSetup">
                    <a-form-item
                        label="New Password"
                        name="password"
                        class="custom-item"
                        :rules="[
                            { required: true, message: 'Please input your password' },
                            { min: 6, message: 'Password must be at least 6 characters' },
                        ]"
                    >
                        <a-input-password v-model:value="form.password" placeholder="Min. 6 characters" size="large">
                            <template #prefix><LockOutlined class="prefix-icon" /></template>
                        </a-input-password>
                    </a-form-item>

                    <a-form-item
                        label="Confirm Password"
                        name="confirm"
                        class="custom-item"
                        :rules="[
                            { required: true, message: 'Please confirm your password' },
                            { validator: validateConfirmPassword },
                        ]"
                    >
                        <a-input-password v-model:value="form.confirm" placeholder="Confirm your password" size="large">
                            <template #prefix><LockOutlined class="prefix-icon" /></template>
                        </a-input-password>
                    </a-form-item>

                    <a-button
                        type="primary"
                        html-type="submit"
                        block
                        size="large"
                        :loading="loading"
                        class="login-button"
                    >
                        COMPLETE REGISTRATION
                    </a-button>
                </a-form>
            </div>

            <div v-else class="error-state">
                <a-result status="error" title="Link Expired">
                    <template #subTitle>
                        <span class="error-subtitle">This invitation link is no longer valid.</span>
                    </template>
                    <template #extra>
                        <a-button type="primary" class="login-button" @click="navigateTo('/login')">
                            Request New Link
                        </a-button>
                    </template>
                </a-result>
            </div>
        </a-card>
    </div>
</template>

<script setup>
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

definePageMeta({
    layout: 'blank',
})

const route = useRoute()
const token = route.query.token

const email = ref('')
const validToken = ref(false)
const verifying = ref(true)
const loading = ref(false)

const form = reactive({
    password: '',
    confirm: '',
})

const validateConfirmPassword = async (_rule, value) => {
    if (!value) return Promise.reject('Please confirm your password')
    if (value !== form.password) return Promise.reject('Passwords do not match!')
    return Promise.resolve()
}

onMounted(async () => {
    if (!token) {
        validToken.value = false
        verifying.value = false
        return
    }
    try {
        const data = await useApi().fetch('/api/auth/verify-token', { query: { token } })
        email.value = data.email
        validToken.value = true
    } catch (err) {
        validToken.value = false
    } finally {
        verifying.value = false
    }
})

const handleSetup = async () => {
    loading.value = true
    try {
        await useApi().fetch('/api/auth/setup-password', {
            method: 'POST',
            body: { token, password: form.password },
        })
        message.success('Password set successfully! Redirecting to login...')
        setTimeout(() => navigateTo('/login'), 2000)
    } catch (err) {
        message.error(err.data?.message || 'Failed to update password.')
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

    // ปรับสไตล์ Spinner ของ Card
    :deep(.ant-spin-dot-item) {
        background-color: $color-gold;
    }
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
        line-height: 1.5;
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
    }
}

// Error State Styling
.error-state {
    :deep(.ant-result-title) {
        color: #fff !important;
    }
    .error-subtitle {
        color: rgba(255, 255, 255, 0.5);
    }
}

// Form Overrides
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
