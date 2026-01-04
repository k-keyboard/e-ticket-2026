<template>
    <div class="auth-container">
        <a-card class="auth-card" :bordered="false" :loading="verifying">
            <div v-if="validToken">
                <div class="auth-header">
                    <h1 class="brand-title">Set Password</h1>
                    <p class="auth-subtitle">
                        Setting up account for: <strong>{{ email }}</strong>
                    </p>
                </div>

                <a-form 
                    :model="form" 
                    layout="vertical" 
                    @finish="handleSetup"
                >
                    <a-form-item
                        label="New Password"
                        name="password"
                        :rules="[
                            { required: true, message: 'Please input your password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]"
                    >
                        <a-input-password 
                            v-model:value="form.password" 
                            placeholder="Min. 6 characters" 
                            size="large" 
                        />
                    </a-form-item>

                    <a-form-item
                        label="Confirm Password"
                        name="confirm"
                        :rules="[
                            { required: true, message: 'Please confirm your password' },
                            { validator: validateConfirmPassword }
                        ]"
                    >
                        <a-input-password
                            v-model:value="form.confirm"
                            placeholder="Confirm your password"
                            size="large"
                        />
                    </a-form-item>

                    <a-button 
                        type="primary" 
                        html-type="submit" 
                        block 
                        size="large" 
                        :loading="loading"
                    >
                        Complete Registration
                    </a-button>
                </a-form>
            </div>

            <a-result
                v-else
                status="error"
                title="Invalid or Expired Link"
                sub-title="This invitation link is no longer valid. Please request a new one."
            >
                <template #extra>
                    <a-button type="primary" @click="navigateTo('/register')">
                        Request New Link
                    </a-button>
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

// 2. ใช้ reactive สำหรับจัดการข้อมูล Form (มาตรฐาน Ant Design Vue)
const form = reactive({ 
    password: '', 
    confirm: '' 
})

// ฟังก์ชันตรวจสอบการยืนยันรหัสผ่าน (Custom Validator)
const validateConfirmPassword = async (_rule, value) => {
    if (!value) {
        return Promise.reject('Please confirm your password')
    }
    if (value !== form.password) {
        return Promise.reject('Passwords do not match!')
    }
    return Promise.resolve()
}

onMounted(async () => {
    if (!token) {
        validToken.value = false
        verifying.value = false
        return
    }
    try {
        // ตรวจสอบ Token ผ่าน API ที่ใช้ baseURL ของเรา
        const data = await useApi().fetch('/api/auth/verify-token', { 
            query: { token } 
        })
        email.value = data.email
        validToken.value = true
    } catch (err) {
        validToken.value = false
        console.error('Token verification failed:', err)
    } finally {
        verifying.value = false
    }
})

const handleSetup = async () => {
    loading.value = true
    try {
        await useApi().fetch('/api/auth/setup-password', {
            method: 'POST',
            body: { 
                token, 
                password: form.password 
            },
        })
        message.success('Password set successfully! Redirecting to login...')
        setTimeout(() => navigateTo('/login'), 2000)
    } catch (err) {
        const errorMsg = err.data?.message || 'Failed to update password.'
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
    background-color: #f0f2f5;
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
    font-size: 24px;
    font-weight: 700;
    color: #1890ff;
    margin-bottom: 8px;
}

.auth-subtitle {
    color: #8c8c8c;
    font-size: 14px;
}
</style>