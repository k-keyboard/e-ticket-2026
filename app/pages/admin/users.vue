<script setup>
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    MailOutlined,
    SyncOutlined,
    TeamOutlined,
    MoreOutlined, // เพิ่ม icon สำหรับเมนูมือถือ
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Layout & Meta
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการผู้ใช้งาน | Lanna Admin' })

// 2. Data Fetching
const { data, pending, refresh } = await useFetch('/api/users')
const userList = ref([])

watch(
    data,
    (newData) => {
        if (newData) {
            userList.value = newData.map((user) => ({
                ...user,
                statusLoading: false,
            }))
        }
    },
    { immediate: true }
)

// 3. States
const isModalOpen = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const formState = reactive({
    id: null,
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    status: 'active',
})

// 4. Modal Handlers
const openAddModal = () => {
    isEditing.value = false
    Object.assign(formState, {
        id: null,
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        status: 'active',
    })
    isModalOpen.value = true
}

const openEditModal = (record) => {
    isEditing.value = true
    Object.assign(formState, { ...record })
    isModalOpen.value = true
}

// 5. Save Action
const handleSave = async () => {
    try {
        await formRef.value.validate()
        submitting.value = true
        const method = isEditing.value ? 'PUT' : 'POST'
        const url = isEditing.value ? `/api/users/${formState.id}` : '/api/users'
        await $fetch(url, { method, body: formState })
        message.success(`${isEditing.value ? 'แก้ไข' : 'เพิ่ม'}ผู้ใช้งานสำเร็จ`)
        isModalOpen.value = false
        refresh()
    } catch (err) {
        if (err.name !== 'ValidationError') message.error('บันทึกข้อมูลล้มล้ว')
    } finally {
        submitting.value = false
    }
}

// 6. Status Toggle
const handleSwitchStatus = async (record, checked) => {
    const index = userList.value.findIndex((u) => u.id === record.id)
    if (index === -1) return
    const oldStatus = userList.value[index].status
    const newStatus = checked ? 'active' : 'suspended'

    userList.value[index].status = newStatus
    userList.value[index].statusLoading = true
    try {
        await $fetch(`/api/users/${record.id}/status`, { method: 'PATCH', body: { status: newStatus } })
        message.success(`สถานะผู้ใช้: ${checked ? 'เปิดใช้งาน' : 'ระงับ'}`)
    } catch (err) {
        userList.value[index].status = oldStatus
        message.error('ไม่สามารถเปลี่ยนสถานะได้')
    } finally {
        userList.value[index].statusLoading = false
    }
}

// 7. Actions
const sendResetPassword = (email) => {
    Modal.confirm({
        title: 'ส่งอีเมลรีเซ็ตรหัสผ่าน?',
        content: `ลิงก์ตั้งค่ารหัสผ่านจะถูกส่งไปที่: ${email}`,
        centered: true,
        onOk: async () => {
            try {
                await $fetch('/api/users/forgot-password', { method: 'POST', body: { email } })
                message.success('ส่งอีเมลเรียบร้อยแล้ว')
            } catch (err) {
                message.error('ส่งอีเมลไม่สำเร็จ')
            }
        },
    })
}

const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบผู้ใช้งาน?',
        content: 'ข้อมูลจะหายไปจากระบบอย่างถาวร',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            try {
                await $fetch(`/api/users/${id}`, { method: 'DELETE' })
                message.success('ลบผู้ใช้งานเรียบร้อย')
                refresh()
            } catch (err) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

const columns = [
    { title: 'ผู้ใช้งาน', key: 'user' },
    { title: 'บทบาท', key: 'role', width: 120 },
    { title: 'สถานะ', key: 'status', width: 100, align: 'center' },
    { title: 'จัดการ', key: 'action', width: 150, align: 'right', responsive: ['md'] },
]

// Helper function สำหรับสี Tag
const getRoleColor = (role) => {
    if (role === 'owner') return 'purple'
    if (role === 'staff') return 'gold'
    return 'blue'
}
</script>

<template>
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <TeamOutlined class="icon-gold" /> จัดการผู้ใช้งาน
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    จัดการสิทธิ์เจ้าหน้าที่และผู้ใช้งานในระบบล้านนา
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <a-button type="primary" @click="openAddModal" class="gold-btn">
                    <template #icon><UserAddOutlined /></template> เพิ่มผู้ใช้งาน
                </a-button>
            </a-space>
        </div>

        <a-card :bordered="false" class="shadow-sm desktop-only">
            <a-table :columns="columns" :data-source="userList" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'user'">
                        <a-space direction="vertical" :size="0">
                            <a-typography-text strong>{{ record.email }}</a-typography-text>
                            <small class="text-muted">ID: {{ record.id }}</small>
                        </a-space>
                    </template>

                    <template v-else-if="column.key === 'role'">
                        <a-tag :color="getRoleColor(record.role)">
                            {{ record.role.toUpperCase() }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-switch
                            :checked="record.status === 'active'"
                            :loading="record.statusLoading"
                            size="small"
                            @change="(checked) => handleSwitchStatus(record, checked)"
                        />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button size="small" @click="openEditModal(record)">
                                <template #icon><EditOutlined /></template>
                            </a-button>
                            <a-button size="small" @click="sendResetPassword(record.email)">
                                <template #icon><MailOutlined /></template>
                            </a-button>
                            <a-button size="small" danger @click="handleDelete(record.id)">
                                <template #icon><DeleteOutlined /></template>
                            </a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <div class="mobile-only">
            <a-list :loading="pending" :data-source="userList">
                <template #renderItem="{ item }">
                    <a-card class="mobile-user-card shadow-sm">
                        <div class="card-header">
                            <div class="user-info">
                                <a-typography-text strong>{{ item.email }}</a-typography-text>
                                <div>
                                    <a-tag :color="getRoleColor(item.role)" size="small">
                                        {{ item.role.toUpperCase() }}
                                    </a-tag>
                                </div>
                            </div>
                            <a-switch
                                :checked="item.status === 'active'"
                                :loading="item.statusLoading"
                                size="small"
                                @change="(checked) => handleSwitchStatus(item, checked)"
                            />
                        </div>

                        <div class="card-footer">
                            <a-space>
                                <a-button size="small" @click="openEditModal(item)"> <EditOutlined /> แก้ไข </a-button>
                                <a-button size="small" @click="sendResetPassword(item.email)">
                                    <MailOutlined /> รีเซ็ต
                                </a-button>
                                <a-button size="small" danger @click="handleDelete(item.id)">
                                    <DeleteOutlined />
                                </a-button>
                            </a-space>
                        </div>
                    </a-card>
                </template>
            </a-list>
        </div>

        <a-modal
            v-model:open="isModalOpen"
            :title="isEditing ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'"
            @ok="handleSave"
            :confirmLoading="submitting"
            centered
            :width="450"
        >
            <a-form ref="formRef" :model="formState" layout="vertical" class="lanna-form">
                <a-form-item
                    label="อีเมล (ใช้สำหรับ Login)"
                    name="email"
                    :rules="[{ required: true, type: 'email', message: 'ระบุอีเมลที่ถูกต้อง' }]"
                >
                    <a-input v-model:value="formState.email" placeholder="email@example.com" />
                </a-form-item>

                <template v-if="!isEditing">
                    <a-form-item
                        label="รหัสผ่าน"
                        name="password"
                        :rules="[{ required: true, min: 6, message: 'ขั้นต่ำ 6 ตัวอักษร' }]"
                    >
                        <a-input-password v-model:value="formState.password" />
                    </a-form-item>
                    <a-form-item
                        label="ยืนยันรหัสผ่าน"
                        name="confirmPassword"
                        :rules="[
                            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                            {
                                validator: async (_, v) => {
                                    if (v && v !== formState.password) throw new Error('รหัสผ่านไม่ตรงกัน')
                                },
                            },
                        ]"
                    >
                        <a-input-password v-model:value="formState.confirmPassword" />
                    </a-form-item>
                </template>

                <a-form-item label="บทบาทสิทธิ์การใช้งาน" name="role">
                    <a-select v-model:value="formState.role">
                        <a-select-option value="owner">Owner (ผู้บริหาร)</a-select-option>
                        <a-select-option value="staff">Staff (เจ้าหน้าที่)</a-select-option>
                        <a-select-option value="traveler">Traveler (ผู้ซื้อตั๋ว)</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>
/* Layout */
.admin-container {
    padding: 24px;
}

.header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
}

.icon-gold {
    margin-right: 12px;
    color: #d4af37;
}

.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.gold-btn {
    background-color: #001529;
    border: none;
}

.text-muted {
    color: #8c8c8c;
    font-size: 11px;
}

/* Responsive Logic */
.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .admin-container {
        padding: 12px;
    }
    .header-wrapper {
        flex-direction: column;
        gap: 12px;
    }
    .header-actions {
        width: 100%;
        justify-content: space-between;
    }
    .desktop-only {
        display: none;
    }
    .mobile-only {
        display: block;
    }
    .sub-title {
        display: block;
        font-size: 12px;
        line-height: 1.4;
    }
}

/* Mobile Card Custom Design */
.mobile-user-card {
    margin-bottom: 12px;
    border-radius: 12px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.card-footer {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    display: flex;
    justify-content: flex-end;
}

.lanna-form {
    margin-top: 16px;
}

:deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 700;
}
</style>
