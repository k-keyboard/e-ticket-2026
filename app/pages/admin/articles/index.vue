<script setup>
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    EyeOutlined, 
    FileTextOutlined,
    SyncOutlined,
    GlobalOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Meta & Layout
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการบทความ | Lanna Admin' })

// 2. Data Fetching
const { data: articles, pending, refresh } = await useFetch('/api/articles')

// 3. Delete Logic
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบบทความ?',
        content: 'ข้อมูลบทความและรูปภาพประกอบจะถูกลบถาวร ไม่สามารถกู้คืนได้',
        okText: 'ลบข้อมูล',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        centered: true,
        onOk: async () => {
            try {
                await $fetch(`/api/articles/${id}`, { method: 'DELETE' })
                message.success('ลบบทความเรียบร้อยแล้ว')
                refresh()
            } catch (e) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

// 4. Columns Configuration
const columns = [
    { title: 'หัวข้อบทความ', key: 'title' },
    { title: 'สถานะ', key: 'status', width: 120, align: 'center' },
    { title: 'วันที่สร้าง', dataIndex: 'created_at', key: 'date', width: 180 },
    { title: 'จัดการ', key: 'action', width: 150, align: 'center' },
]

// Date Formatter (ให้เหมือนหน้า Orders/Events)
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
</script>

<template>
    <div style="padding: 24px">
        <a-flex justify="space-between" align="center" style="margin-bottom: 24px">
            <div>
                <a-typography-title :level="2" style="margin: 0">
                    <FileTextOutlined style="margin-right: 12px; color: #d4af37" /> จัดการบทความ
                </a-typography-title>
                <a-typography-text type="secondary">จัดการเนื้อหา ข่าวสาร และบทความเพื่อสุขภาพ SEO ของเว็บไซต์</a-typography-text>
            </div>
            <a-space>
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <NuxtLink to="/admin/articles/create">
                    <a-button type="primary" size="large" class="gold-btn">
                        <template #icon><PlusOutlined /></template> เขียนบทความใหม่
                    </a-button>
                </NuxtLink>
            </a-space>
        </a-flex>

        <a-card :bordered="false" class="shadow-sm">
            <a-table :columns="columns" :data-source="articles" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    
                    <template v-if="column.key === 'title'">
                        <a-space align="start">
                            <GlobalOutlined style="margin-top: 4px; color: #bfbfbf" />
                            <a-flex vertical>
                                <a-typography-text strong>{{ record.title }}</a-typography-text>
                                <a-typography-text type="secondary" style="font-size: 12px">
                                    /blog/{{ record.slug }}
                                </a-typography-text>
                            </a-flex>
                        </a-space>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="record.status === 'published' ? 'green' : 'orange'">
                            {{ record.status === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง' }}
                        </a-tag>
                    </template>

                    <template v-if="column.key === 'date'">
                        <a-typography-text type="secondary">
                            {{ formatDate(record.created_at) }}
                        </a-typography-text>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-tooltip title="ดูหน้าเว็บจริง">
                                <a-button size="small" :href="`/blog/${record.slug}`" target="_blank">
                                    <template #icon><EyeOutlined /></template>
                                </a-button>
                            </a-tooltip>

                            <a-tooltip title="แก้ไข">
                                <NuxtLink :to="`/admin/articles/edit/${record.id}`">
                                    <a-button size="small">
                                        <template #icon><EditOutlined /></template>
                                    </a-button>
                                </NuxtLink>
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
    </div>
</template>

<style scoped>
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.gold-btn {
    background-color: #001529; /* สีน้ำเงินเข้มหลัก */
    border: none;
}

.gold-btn:hover {
    background-color: #d4af37 !important; /* เปลี่ยนเป็นทองเมื่อ hover */
    color: #001529 !important;
}

:deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 700;
}
</style>