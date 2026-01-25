<script setup>
    import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
    import { message, Modal } from 'ant-design-vue'
    import dayjs from 'dayjs'
    import customParseFormat from 'dayjs/plugin/customParseFormat'
    
    // เพิ่ม Plugin สำหรับการอ่าน Format เวลาแบบ 12-hour (AM/PM)
    dayjs.extend(customParseFormat)
    
    definePageMeta({
        layout: 'admin',
    })
    
    // 1. ดึงข้อมูล Events จาก API
    const { data: events, pending, refresh } = await useFetch('/api/events')
    
    // 2. สถานะสำหรับ Modal (Add/Edit)
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
    
    // 3. ฟังก์ชันจัดการ Modal
    const openAddModal = () => {
        isEditing.value = false
        Object.assign(formState, {
            id: null,
            event_time: null, // เริ่มต้นค่าว่างเพื่อให้ TimePicker แสดง Placeholder
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
    
    // 4. บันทึกข้อมูล (Add/Update)
    const handleSave = async () => {
        try {
            await formRef.value.validate()
            submitting.value = true
    
            const method = isEditing.value ? 'PUT' : 'POST'
            const url = isEditing.value ? `/api/events/${formState.id}` : '/api/events'
    
            await $fetch(url, {
                method,
                body: formState,
            })
    
            message.success(`${isEditing.value ? 'Updated' : 'Created'} successfully`)
            isModalOpen.value = false
            refresh() // โหลดข้อมูลใหม่เพื่อให้ตารางเรียงลำดับใหม่ตามเวลา
        } catch (err) {
            if (err.name !== 'ValidationError') {
                message.error('Failed to save event')
            }
        } finally {
            submitting.value = false
        }
    }
    
    // 5. ลบข้อมูล
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this event?',
            content: 'This will remove the event from the schedule on the homepage.',
            okText: 'Yes, Delete',
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
    
    // กำหนดหัวตาราง (นำ Order ออก)
    const columns = [
        { 
            title: 'Time', 
            dataIndex: 'event_time', 
            key: 'event_time', 
            width: '160px',
            // ฟังก์ชันเรียงลำดับเวลาในตาราง (Frontend)
            // sorter: (a, b) => dayjs(a.event_time, 'hh:mm A').unix() - dayjs(b.event_time, 'hh:mm A').unix(),
            defaultSortOrder: 'ascend',
        },
        { title: 'Event Title', dataIndex: 'title', key: 'title', width: '250px' },
        { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
        { title: 'Actions', key: 'action', width: '120px' },
    ]
    </script>
    
    <template>
        <div class="admin-event-page">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold">Event Schedule Management</h1>
                    <p class="text-gray-500">Add or edit activities. The list is automatically sorted by time.</p>
                </div>
                <a-button type="primary" size="large" @click="openAddModal">
                    <template #icon><plus-outlined /></template>
                    Add New Activity
                </a-button>
            </div>
    
            <a-card :bordered="false" class="shadow-sm">
                <a-table
                    :columns="columns"
                    :data-source="events"
                    :loading="pending"
                    :pagination="{ pageSize: 10 }"
                    row-key="id"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'event_time'">
                            <a-tag color="blue">
                                <clock-circle-outlined /> {{ record.event_time }}
                            </a-tag>
                        </template>
    
                        <template v-else-if="column.key === 'action'">
                            <div class="flex gap-2">
                                <a-tooltip title="Edit">
                                    <a-button size="small" @click="openEditModal(record)">
                                        <template #icon><edit-outlined /></template>
                                    </a-button>
                                </a-tooltip>
                                <a-tooltip title="Delete">
                                    <a-button size="small" danger @click="handleDelete(record.id)">
                                        <template #icon><delete-outlined /></template>
                                    </a-button>
                                </a-tooltip>
                            </div>
                        </template>
                    </template>
                </a-table>
            </a-card>
    
            <a-modal
                v-model:open="isModalOpen"
                :title="isEditing ? 'Update Event Activity' : 'Add New Activity'"
                @ok="handleSave"
                :confirmLoading="submitting"
                destroyOnClose
                ok-text="Save"
            >
                <a-form ref="formRef" :model="formState" layout="vertical" class="mt-4">
                    <a-form-item
                        label="Activity Time"
                        name="event_time"
                        :rules="[{ required: true, message: 'Please select a time' }]"
                    >
                        <a-time-picker
                            v-model:value="formState.event_time"
                            format="hh:mm A"
                            value-format="hh:mm A"
                            use12-hours
                            placeholder="Select Time (AM/PM)"
                            class="w-full"
                        />
                    </a-form-item>
    
                    <a-form-item
                        label="Activity Title"
                        name="title"
                        :rules="[{ required: true, message: 'Please enter a title' }]"
                    >
                        <a-input v-model:value="formState.title" placeholder="e.g., Grand Ceremony Open" />
                    </a-form-item>
    
                    <a-form-item label="Description" name="description">
                        <a-textarea
                            v-model:value="formState.description"
                            :rows="4"
                            placeholder="Brief details about this activity..."
                        />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>
    </template>
    
    <style scoped>
    .admin-event-page {
        padding: 24px;
    }
    .flex {
        display: flex;
    }
    .justify-between {
        justify-content: space-between;
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
    .gap-2 {
        gap: 0.5rem;
    }
    .w-full {
        width: 100%;
    }
    
    /* ปรับแต่ง Table Header เล็กน้อย */
    :deep(.ant-table-thead > tr > th) {
        /* background-color: #fafafa; */
        font-weight: 600;
    }
    </style>