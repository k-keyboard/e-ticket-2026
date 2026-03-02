<script setup>
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    SyncOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Plugin สำหรับ Format เวลา AM/PM
dayjs.extend(customParseFormat)

// 1. Setup Meta & Layout
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการกำหนดการ | Lanna Admin' })

// 2. Data Fetching
const { data: events, pending, refresh } = await useFetch('/api/events')

// 3. States สำหรับ Modal
const isModalOpen = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const formState = reactive({
    id: null,
    event_time: '',
    title: '',
    description: '',
})

// 4. Modal Handlers
const openAddModal = () => {
    isEditing.value = false
    Object.assign(formState, {
        id: null,
        event_time: null,
        title: '',
        description: '',
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
        const url = isEditing.value ? `/api/events/${formState.id}` : '/api/events'

        await $fetch(url, { method, body: formState })

        message.success(`${isEditing.value ? 'Updated' : 'Created'} successfully`)
        isModalOpen.value = false
        refresh()
    } catch (err) {
        if (err.name !== 'ValidationError') message.error('Failed to save event')
    } finally {
        submitting.value = false
    }
}

// 6. Delete Action
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบกิจกรรม?',
        content: 'กิจกรรมนี้จะถูกลบออกจากตารางกำหนดการบนหน้าเว็บไซต์',
        okText: 'ลบข้อมูล',
        okType: 'danger',
        onOk: async () => {
            try {
                await $fetch(`/api/events/${id}`, { method: 'DELETE' })
                message.success('Deleted successfully')
                refresh()
            } catch (err) {
                message.error('Delete failed')
            }
        },
    })
}

// 7. Table Columns Config
const columns = [
    { title: 'เวลา', key: 'event_time', width: 150 },
    { title: 'ชื่อกิจกรรม', dataIndex: 'title', key: 'title', width: 250 },
    { title: 'รายละเอียด', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'จัดการ', key: 'action', width: 120, align: 'center' },
]
</script>

<template>
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <CalendarOutlined class="icon-gold" /> จัดการกำหนดการ
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    แก้ไขกิจกรรมและเวลาแสดงผล (เรียงลำดับตามเวลาอัตโนมัติ)
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <a-button type="primary" @click="openAddModal" class="gold-btn">
                    <template #icon><PlusOutlined /></template> เพิ่มกิจกรรม
                </a-button>
            </a-space>
        </div>

        <a-card :bordered="false" class="shadow-sm desktop-only">
            <a-table
                :columns="columns"
                :data-source="events"
                :loading="pending"
                row-key="id"
                :pagination="{ pageSize: 10, showTotal: (total) => `ทั้งหมด ${total} รายการ` }"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'event_time'">
                        <a-tag color="blue" style="font-weight: 600">
                            <ClockCircleOutlined style="margin-right: 4px" />
                            {{ record.event_time }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button size="small" @click="openEditModal(record)">
                                <template #icon><EditOutlined /></template>
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
            <a-list :loading="pending" :data-source="events">
                <template #renderItem="{ item }">
                    <a-card class="mobile-event-card">
                        <div class="event-card-header">
                            <a-tag color="blue" class="time-tag"> <ClockCircleOutlined /> {{ item.event_time }} </a-tag>
                            <div class="card-actions-mini">
                                <a-button type="text" size="small" @click="openEditModal(item)">
                                    <EditOutlined style="color: #1890ff" />
                                </a-button>
                                <a-button type="text" size="small" danger @click="handleDelete(item.id)">
                                    <DeleteOutlined />
                                </a-button>
                            </div>
                        </div>

                        <div class="event-card-body">
                            <a-typography-text strong class="event-title">
                                {{ item.title }}
                            </a-typography-text>
                            <p class="event-desc" v-if="item.description">
                                {{ item.description }}
                            </p>
                        </div>
                    </a-card>
                </template>
            </a-list>
        </div>

        <a-modal
            v-model:open="isModalOpen"
            :title="isEditing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'"
            @ok="handleSave"
            :confirmLoading="submitting"
            destroyOnClose
            centered
            :width="450"
        >
            <a-form ref="formRef" :model="formState" layout="vertical" class="modal-form">
                <a-form-item
                    label="เวลาจัดกิจกรรม"
                    name="event_time"
                    :rules="[{ required: true, message: 'กรุณาระบุเวลา' }]"
                >
                    <a-time-picker
                        v-model:value="formState.event_time"
                        format="hh:mm A"
                        value-format="hh:mm A"
                        use12-hours
                        placeholder="เลือกเวลา (AM/PM)"
                        style="width: 100%"
                        size="large"
                    />
                </a-form-item>

                <a-form-item
                    label="ชื่อกิจกรรม"
                    name="title"
                    :rules="[{ required: true, message: 'กรุณาระบุชื่อกิจกรรม' }]"
                >
                    <a-input v-model:value="formState.title" placeholder="เช่น พิธีเปิดงานโคมล้านนา" size="large" />
                </a-form-item>

                <a-form-item label="รายละเอียดกิจกรรม" name="description">
                    <a-textarea v-model:value="formState.description" :rows="4" placeholder="ระบุรายละเอียดคร่าวๆ..." />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>
/* Common Layout */
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

/* Buttons */
.gold-btn {
    background-color: #001529;
    border: none;
    height: 40px;
}
.gold-btn:hover {
    background-color: #d4af37 !important;
    color: #001529 !important;
}

/* Responsive Logic */
.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .admin-container {
        padding: 16px;
    }
    .header-wrapper {
        flex-direction: column;
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
        margin-bottom: 8px;
    }
}

/* Mobile Card Styles */
.mobile-event-card {
    margin-bottom: 12px;
    border-radius: 12px;
    border-left: 4px solid #1890ff; /* แถบสีตามเวลา */
}
.event-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.time-tag {
    font-size: 14px;
    font-weight: bold;
}
.event-title {
    font-size: 16px;
    display: block;
    color: #001529;
}
.event-desc {
    margin-top: 4px;
    color: #8c8c8c;
    font-size: 13px;
    line-height: 1.5;
}
.card-actions-mini {
    display: flex;
    gap: 4px;
}

/* Modal Form Styles */
.modal-form {
    margin-top: 12px;
}
</style>
