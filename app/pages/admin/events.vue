<script setup>
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    ClockCircleOutlined,
    CalendarOutlined,
    SyncOutlined
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
            } catch (err) { message.error('Delete failed') }
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
    <div style="padding: 24px">
        <a-flex justify="space-between" align="center" style="margin-bottom: 24px">
            <div>
                <a-typography-title :level="2" style="margin: 0">
                    <CalendarOutlined style="margin-right: 12px; color: #d4af37" /> จัดการกำหนดการ
                </a-typography-title>
                <a-typography-text type="secondary">แก้ไขกิจกรรมและเวลาแสดงผลในหน้าแรก (เรียงลำดับตามเวลาอัตโนมัติ)</a-typography-text>
            </div>
            <a-space>
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <a-button type="primary" size="large" @click="openAddModal" class="gold-btn">
                    <template #icon><PlusOutlined /></template> เพิ่มกิจกรรมใหม่
                </a-button>
            </a-space>
        </a-flex>

        <a-card :bordered="false" class="shadow-sm">
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
                            <a-tooltip title="แก้ไข">
                                <a-button size="small" @click="openEditModal(record)">
                                    <template #icon><EditOutlined /></template>
                                </a-button>
                            </a-tooltip>
                            <a-tooltip title="ลบ">
                                <a-button size="small" danger @click="handleDelete(record.id)">
                                    <template #icon><DeleteOutlined /></template>
                                </a-button>
                            </a-tooltip>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal
            v-model:open="isModalOpen"
            :title="isEditing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'"
            @ok="handleSave"
            :confirmLoading="submitting"
            destroyOnClose
            centered
        >
            <a-form ref="formRef" :model="formState" layout="vertical" style="margin-top: 20px">
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
                    />
                </a-form-item>

                <a-form-item
                    label="ชื่อกิจกรรม"
                    name="title"
                    :rules="[{ required: true, message: 'กรุณาระบุชื่อกิจกรรม' }]"
                >
                    <a-input v-model:value="formState.title" placeholder="เช่น พิธีเปิดงานโคมล้านนา" />
                </a-form-item>

                <a-form-item label="รายละเอียดกิจกรรม" name="description">
                    <a-textarea
                        v-model:value="formState.description"
                        :rows="4"
                        placeholder="ระบุรายละเอียดคร่าวๆ ของกิจกรรมนี้..."
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<style scoped>
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.gold-btn {
    background-color: #001529;
    border: none;
}

.gold-btn:hover {
    background-color: #d4af37 !important;
    color: #001529 !important;
}

:deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 700;
}
</style>