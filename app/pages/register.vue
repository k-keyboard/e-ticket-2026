<template>
    <div class="auth-container">
        <a-card class="auth-card" :bordered="false">
            <div class="auth-header">
                <h1 class="brand-title">Register</h1>
                <p class="auth-subtitle">Enter your email to receive a setup link.</p>
            </div>

            <a-form :model="form" layout="vertical" @finish="handleRegister">
                <!-- <a-form-item label="Account Type" name="role">
                    <a-select v-model:value="form.role" size="large">
                        <a-select-option value="traveler">Traveler</a-select-option>
                        <a-select-option value="staff">Staff Member</a-select-option>
                        <a-select-option value="owner">Owner</a-select-option>
                    </a-select>
                </a-form-item> -->
                <a-form-item
                    label="Email Address"
                    name="email"
                    :rules="[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' },
                    ]"
                >
                    <a-input v-model:value.trim="form.email" placeholder="yourname@domain.com" size="large" />
                </a-form-item>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading">
                    Send Invitation Link
                </a-button>

                <div class="auth-footer">Already have an account? <NuxtLink to="/login">Sign In</NuxtLink></div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { message } from 'ant-design-vue'

// ใช้ reactive สำหรับจัดการ Form ข้อมูล (ไม่ต้องใช้ .value)
const form = reactive({
    email: '',
    role: 'traveler',
})

const loading = ref(false)

const handleRegister = async () => {
    loading.value = true
    try {
        // ส่งข้อมูลไปยัง API invite.post.ts
        // body: form (ส่งก้อน reactive ไปได้เลยโดยไม่ต้องมี .value)
        await useApi().fetch('/api/auth/invite', {
            method: 'POST',
            body: form,
        })

        message.success('Invitation sent! Please check your email inbox.')

        // ล้างค่าอีเมลหลังจากส่งสำเร็จ (Optional)
        form.email = ''
    } catch (err) {
        // แสดง Error message จาก Backend
        const errorMsg = err.data?.statusMessage || err.message || 'Failed to send email'
        message.error('Error: ' + errorMsg)
    } finally {
        loading.value = false
    }
}
</script>
