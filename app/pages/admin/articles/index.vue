<script setup>
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

definePageMeta({ layout: 'admin' })

// 1. ดึงข้อมูลรายการบทความ
const { data: articles, pending, refresh } = await useFetch('/api/articles')

// 2. ฟังก์ชันลบบทความ
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบบทความ?',
        content: 'เมื่อลบแล้วจะไม่สามารถกู้คืนข้อมูลและรูปภาพที่เกี่ยวข้องได้',
        okText: 'ลบ',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        onOk: async () => {
            try {
                await $fetch(`/api/articles/${id}`, { method: 'DELETE' })
                message.success('ลบบทความสำเร็จ')
                refresh()
            } catch (e) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

const columns = [
    { title: 'หัวข้อ', dataIndex: 'title', key: 'title' },
    { title: 'สถานะ', key: 'status', width: '120px', align: 'center' },
    { title: 'วันที่สร้าง', dataIndex: 'created_at', key: 'created_at', width: '180px' },
    { title: 'จัดการ', key: 'action', width: '150px', align: 'center' },
]

// ฟังก์ชันสำหรับ Format วันที่ (แบบง่าย)
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">จัดการบทความ (Articles)</h1>
                <p class="text-gray-500">จัดการเนื้อหาข่าวสารและบทความ SEO ของคุณ</p>
            </div>
            <NuxtLink to="/admin/articles/create">
                <a-button type="primary" size="large">
                    <template #icon><PlusOutlined /></template> เขียนบทความใหม่
                </a-button>
            </NuxtLink>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-table :columns="columns" :data-source="articles" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'title'">
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-800">{{ record.title }}</span>
                            <small class="text-gray-400">/blog/{{ record.slug }}</small>
                        </div>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="record.status === 'published' ? 'green' : 'orange'">
                            {{ record.status === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง' }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'created_at'">
                        {{ formatDate(record.created_at) }}
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <div class="flex gap-2 justify-center">
                            <a-tooltip title="ดูหน้าเว็บ">
                                <a-button size="small" :href="`/blog/${record.slug}`" target="_blank">
                                    <template #icon><EyeOutlined /></template>
                                </a-button>
                            </a-tooltip>

                            <NuxtLink :to="`/admin/articles/edit/${record.id}`">
                                <a-button size="small">
                                    <template #icon><EditOutlined /></template>
                                </a-button>
                            </NuxtLink>

                            <a-button size="small" danger @click="handleDelete(record.id)">
                                <template #icon><DeleteOutlined /></template>
                            </a-button>
                        </div>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>
