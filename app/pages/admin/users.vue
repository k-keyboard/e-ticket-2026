<script setup>
import { UserAddOutlined, EditOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

definePageMeta({
    layout: 'admin',
})

// 1. ดึงข้อมูลผู้ใช้งานจาก API
const { data, pending, refresh } = await useFetch('/api/users')

// 2. สร้าง Ref แยกเพื่อให้ Vue จัดการ Reactivity ได้เต็มที่ (แก้ปัญหา UI ไม่เปลี่ยน)
const userList = ref([])

// คัดลอกข้อมูลจาก useFetch มาลง userList เมื่อข้อมูลมาถึง
watch(
    data,
    (newData) => {
        if (newData) {
            userList.value = newData.map((user) => ({
                ...user,
                statusLoading: false, // เพิ่มฟิลด์ไว้คุมสถานะการโหลดแต่ละแถว
            }))
        }
    },
    { immediate: true }
)

// 3. State สำหรับ Modal
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

// 4. จัดการ Modal
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

// 5. บันทึกข้อมูล (Add/Update)
const handleSave = async () => {
    try {
        await formRef.value.validate()
        submitting.value = true

        const method = isEditing.value ? 'PUT' : 'POST'
        const url = isEditing.value ? `/api/users/${formState.id}` : '/api/users'

        await $fetch(url, { method, body: formState })

        message.success(`${isEditing.value ? 'แก้ไข' : 'เพิ่ม'}ผู้ใช้งานสำเร็จ`)
        isModalOpen.value = false
        refresh() // สั่ง refresh useFetch เพื่ออัปเดตข้อมูลใหม่ทั้งหมด
    } catch (err) {
        if (err.name !== 'ValidationError') message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        submitting.value = false
    }
}

// 6. ระบบเลื่อนเปิด-ปิด สถานะ (Optimistic UI Update)
const handleSwitchStatus = async (record, checked) => {
    // หา index ใน userList เพื่ออัปเดตให้ Vue รับรู้
    const index = userList.value.findIndex((u) => u.id === record.id)
    if (index === -1) return

    const oldStatus = userList.value[index].status
    const newStatus = checked ? 'active' : 'suspended'

    // อัปเดต UI ทันที (Optimistic Update)
    userList.value[index].status = newStatus
    userList.value[index].statusLoading = true

    try {
        await $fetch(`/api/users/${record.id}/status`, {
            method: 'PATCH',
            body: { status: newStatus },
        })
        message.success(`อัปเดตสถานะเป็น ${checked ? 'เปิดใช้งาน' : 'ระงับใช้งาน'} สำเร็จ`)
    } catch (err) {
        // หาก API ล้มเหลว ให้ดีดกลับเป็นค่าเดิม
        userList.value[index].status = oldStatus
        message.error('ไม่สามารถเปลี่ยนสถานะได้')
    } finally {
        userList.value[index].statusLoading = false
    }
}

// 7. ส่งอีเมลรีเซ็ตรหัสผ่าน
const sendResetPassword = (email) => {
    Modal.confirm({
        title: 'ยืนยันการส่งอีเมล?',
        content: `ระบบจะส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปยังอีเมล: ${email}`,
        okText: 'ส่งอีเมล',
        cancelText: 'ยกเลิก',
        onOk: async () => {
            try {
                await $fetch('/api/users/forgot-password', { method: 'POST', body: { email } })
                message.success('ส่งอีเมลแจ้งลืมรหัสผ่านเรียบร้อยแล้ว')
            } catch (err) {
                message.error('ไม่สามารถส่งอีเมลได้')
            }
        },
    })
}

// 8. ลบผู้ใช้งาน
const handleDelete = (id) => {
    Modal.confirm({
        title: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?',
        content: 'ข้อมูลผู้ใช้งานจะถูกลบออกจากระบบอย่างถาวร',
        okText: 'ยืนยันการลบ',
        okType: 'danger',
        onOk: async () => {
            try {
                await $fetch(`/api/users/${id}`, { method: 'DELETE' })
                message.success('ลบผู้ใช้งานสำเร็จ')
                refresh()
            } catch (err) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

const columns = [
    { title: 'อีเมล', dataIndex: 'email', key: 'email' },
    { title: 'บทบาท', dataIndex: 'role', key: 'role', width: '120px' },
    { title: 'สถานะ', key: 'status', width: '120px', align: 'center' },
    { title: 'จัดการ', key: 'action', width: '150px', align: 'center' },
]
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold">จัดการผู้ใช้งาน (User Management)</h1>
                <p class="text-gray-500">จัดการสิทธิ์และเปิด-ปิดสถานะตามเงื่อนไขฐานข้อมูล</p>
            </div>
            <a-button type="primary" size="large" @click="openAddModal">
                <template #icon><UserAddOutlined /></template> เพิ่มผู้ใช้งาน
            </a-button>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-table :columns="columns" :data-source="userList" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'role'">
                        <a-tag
                            :color="record.role === 'owner' ? 'purple' : record.role === 'staff' ? 'blue' : 'orange'"
                        >
                            {{ record.role.toUpperCase() }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-switch
                            :checked="record.status === 'active'"
                            :loading="record.statusLoading"
                            checked-children="เปิด"
                            un-checked-children="ปิด"
                            @change="(checked) => handleSwitchStatus(record, checked)"
                        />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <div class="flex gap-2 justify-center">
                            <a-button size="small" @click="openEditModal(record)">
                                <template #icon><EditOutlined /></template>
                            </a-button>
                            <a-button size="small" @click="sendResetPassword(record.email)">
                                <template #icon><MailOutlined /></template>
                            </a-button>
                            <a-button size="small" danger @click="handleDelete(record.id)">
                                <template #icon><DeleteOutlined /></template>
                            </a-button>
                        </div>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal
            v-model:open="isModalOpen"
            :title="isEditing ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'"
            @ok="handleSave"
            :confirmLoading="submitting"
        >
            <a-form ref="formRef" :model="formState" layout="vertical" class="mt-4">
                <a-form-item
                    label="อีเมล (Email)"
                    name="email"
                    :rules="[{ required: true, type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง' }]"
                >
                    <a-input v-model:value="formState.email" placeholder="example@domain.com" />
                </a-form-item>

                <template v-if="!isEditing">
                    <a-form-item
                        label="รหัสผ่าน"
                        name="password"
                        :rules="[{ required: true, min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }]"
                    >
                        <a-input-password v-model:value="formState.password" />
                    </a-form-item>
                    <a-form-item
                        label="ยืนยันรหัสผ่าน"
                        name="confirmPassword"
                        :rules="[
                            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
                            {
                                validator: async (_, value) => {
                                    if (!value) return
                                    if (value !== formState.password) throw new Error('รหัสผ่านไม่ตรงกัน')
                                },
                            },
                        ]"
                    >
                        <a-input-password v-model:value="formState.confirmPassword" />
                    </a-form-item>
                </template>

                <a-form-item label="บทบาท (Role)" name="role">
                    <a-select v-model:value="formState.role">
                        <a-select-option value="owner">Owner (ผู้บริหาร)</a-select-option>
                        <a-select-option value="staff">Staff (เจ้าหน้าที่)</a-select-option>
                        <a-select-option value="traveler">Traveler (ผู้ใช้งานทั่วไป)</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>
.flex {
    display: flex;
}
.gap-2 {
    gap: 0.5rem;
}
.justify-between {
    justify-content: space-between;
}
.justify-center {
    justify-content: center;
}
.items-center {
    align-items: center;
}
.mb-6 {
    margin-bottom: 1.5rem;
}
.mt-4 {
    margin-top: 1rem;
}
</style>
