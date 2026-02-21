<script setup>
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    FileTextOutlined,
    SyncOutlined,
    GlobalOutlined,
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
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <FileTextOutlined class="icon-gold" /> จัดการบทความ
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    จัดการเนื้อหา ข่าวสาร และบทความเพื่อสุขภาพ SEO ของเว็บไซต์
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <NuxtLink to="/admin/articles/create">
                    <a-button type="primary" class="gold-btn">
                        <template #icon><PlusOutlined /></template> เขียนบทความใหม่
                    </a-button>
                </NuxtLink>
            </a-space>
        </div>

        <a-card :bordered="false" class="shadow-sm desktop-only">
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
                            <a-button size="small" danger @click="handleDelete(record.id)">
                                <template #icon><DeleteOutlined /></template>
                            </a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <div class="mobile-only">
            <a-list :loading="pending" :data-source="articles">
                <template #renderItem="{ item }">
                    <a-card class="mobile-article-card">
                        <div class="article-card-header">
                            <a-tag :color="item.status === 'published' ? 'green' : 'orange'">
                                {{ item.status === 'published' ? 'เผยแพร่แล้ว' : 'แบบร่าง' }}
                            </a-tag>
                            <small class="text-muted">{{ formatDate(item.created_at) }}</small>
                        </div>

                        <div class="article-card-body">
                            <a-typography-text strong class="article-title">
                                {{ item.title }}
                            </a-typography-text>
                            <div class="article-slug"><GlobalOutlined /> /blog/{{ item.slug }}</div>
                        </div>

                        <div class="article-card-actions">
                            <a-button-group block>
                                <a-button :href="`/blog/${item.slug}`" target="_blank" style="width: 33.33%">
                                    <EyeOutlined />
                                </a-button>
                                <a-button style="width: 33.33%">
                                    <NuxtLink :to="`/admin/articles/edit/${item.id}`">
                                        <EditOutlined />
                                    </NuxtLink>
                                </a-button>
                                <a-button danger @click="handleDelete(item.id)" style="width: 33.33%">
                                    <DeleteOutlined />
                                </a-button>
                            </a-button-group>
                        </div>
                    </a-card>
                </template>
            </a-list>
        </div>
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
.mobile-article-card {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
}
.article-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.article-card-body {
    margin-bottom: 16px;
}
.article-title {
    font-size: 16px;
    display: block;
    line-height: 1.4;
}
.article-slug {
    font-size: 11px;
    color: #bfbfbf;
    margin-top: 4px;
}
.article-card-actions {
    margin-top: 12px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
}

.text-muted {
    color: #8c8c8c;
}
</style>
