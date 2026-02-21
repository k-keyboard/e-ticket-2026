<script setup>
import {
    MailOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    UserOutlined,
    FileTextOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 1. Setup Meta & Layout
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการคำสั่งซื้อ | Yi Peng 2026' })

// 2. Data Fetching
const { data: response, pending, refresh } = await useFetch('/api/orders')
const orders = computed(() => response.value?.data || [])

// 3. States
const searchText = ref('')
const loadingIds = ref(new Set())

// 4. Search Logic
const filteredOrders = computed(() => {
    if (!searchText.value) return orders.value
    const term = searchText.value.toLowerCase()
    return orders.value.filter(
        (order) =>
            order.customer_name?.toLowerCase().includes(term) ||
            order.customer_email?.toLowerCase().includes(term) ||
            order.ticket_code?.toLowerCase().includes(term)
    )
})

// 5. Resend Email Function
const handleResend = async (orderId) => {
    loadingIds.value.add(orderId)
    try {
        await $fetch('/api/orders/resend', {
            method: 'POST',
            body: { orderId },
        })
        message.success('ส่งอีเมลตั๋วให้ลูกค้าใหม่เรียบร้อยแล้ว')
    } catch (error) {
        message.error('ไม่สามารถส่งอีเมลได้')
    } finally {
        loadingIds.value.delete(orderId)
    }
}

// 6. Table Columns Config
const columns = [
    { title: 'วันที่สั่งซื้อ', key: 'date', width: 180 },
    { title: 'รหัสตั๋ว', key: 'code', width: 150 },
    { title: 'ข้อมูลลูกค้า', key: 'customer' },
    { title: 'ประเภทตั๋ว', dataIndex: 'ticket_type', key: 'type' },
    { title: 'สถานะ', key: 'status', width: 150, align: 'center' },
    { title: 'จัดการ', key: 'action', width: 100, align: 'center' },
]

const onSearch = (val) => {
    searchText.value = val
}
</script>

<template>
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <FileTextOutlined class="icon-gold" /> จัดการคำสั่งซื้อ
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    ตรวจสอบประวัติการชำระเงินและจัดการส่งตั๋วซ้ำ
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><ReloadOutlined /></template>
                </a-button>
            </a-space>
        </div>

        <a-row :gutter="[16, 16]" style="margin-bottom: 24px">
            <a-col :xs="24" :md="12" :lg="8">
                <a-input-search
                    v-model:value="searchText"
                    placeholder="ค้นหาชื่อ, อีเมล, หรือรหัสตั๋ว..."
                    size="large"
                    enter-button
                    @search="onSearch"
                />
            </a-col>
        </a-row>

        <a-card :bordered="false" class="shadow-sm desktop-only">
            <a-table
                :columns="columns"
                :data-source="filteredOrders"
                :loading="pending"
                row-key="id"
                :pagination="{
                    pageSize: 10,
                    showTotal: (total) => `ทั้งหมด ${total} รายการ`,
                    showSizeChanger: true,
                }"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'date'">
                        <a-typography-text type="secondary">
                            <ClockCircleOutlined style="margin-right: 8px; opacity: 0.45" />
                            {{ dayjs(record.created_at).format('DD/MM/YYYY HH:mm') }}
                        </a-typography-text>
                    </template>

                    <template v-else-if="column.key === 'code'">
                        <a-tag color="gold" class="code-tag">
                            {{ record.ticket_code }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'customer'">
                        <a-space direction="vertical" :size="0">
                            <a-typography-text strong>
                                <UserOutlined style="margin-right: 4px; color: #bfbfbf" />
                                {{ record.customer_name }}
                            </a-typography-text>
                            <a-typography-text type="secondary" class="email-text">
                                {{ record.customer_email }}
                            </a-typography-text>
                        </a-space>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-badge v-if="record.is_used" status="error" text="ใช้งานแล้ว" />
                        <a-badge v-else status="success" text="ยังไม่ใช้งาน" />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-tooltip title="ส่งตั๋วไปยังอีเมล">
                            <a-button
                                type="primary"
                                shape="circle"
                                class="gold-btn"
                                :loading="loadingIds.has(record.id)"
                                @click="handleResend(record.id)"
                            >
                                <template #icon><MailOutlined /></template>
                            </a-button>
                        </a-tooltip>
                    </template>
                </template>
            </a-table>
        </a-card>

        <div class="mobile-only">
            <a-list :loading="pending" :data-source="filteredOrders" :pagination="{ size: 'small', pageSize: 10 }">
                <template #renderItem="{ item }">
                    <a-card class="mobile-order-card">
                        <div class="order-card-header">
                            <a-tag color="gold" class="code-tag">{{ item.ticket_code }}</a-tag>
                            <a-badge v-if="item.is_used" status="error" text="ใช้งานแล้ว" />
                            <a-badge v-else status="success" text="ยังไม่ใช้งาน" />
                        </div>

                        <div class="order-card-content">
                            <div class="customer-info">
                                <a-typography-text strong>{{ item.customer_name }}</a-typography-text>
                                <a-typography-text type="secondary" class="email-small">{{
                                    item.customer_email
                                }}</a-typography-text>
                            </div>
                            <div class="ticket-type">
                                <a-typography-text type="secondary">ตั๋ว: {{ item.ticket_type }}</a-typography-text>
                            </div>
                            <div class="order-date">
                                <small>{{ dayjs(item.created_at).format('DD/MM/YYYY HH:mm') }}</small>
                            </div>
                        </div>

                        <div class="order-card-footer">
                            <a-button
                                block
                                class="gold-btn-mobile"
                                :loading="loadingIds.has(item.id)"
                                @click="handleResend(item.id)"
                            >
                                <MailOutlined /> ส่งอีเมลตั๋วซ้ำ
                            </a-button>
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

/* Table Elements */
.code-tag {
    font-family: monospace;
    font-weight: bold;
    padding: 0 8px;
}
.email-text {
    font-size: 12px;
    margin-left: 20px;
}

/* Buttons */
.gold-btn {
    background-color: #d4af37;
    border-color: #d4af37;
}
.gold-btn:hover {
    background-color: #b8962d !important;
}

.gold-btn-mobile {
    background-color: #001529;
    color: white;
    border: none;
    height: 40px;
    border-radius: 6px;
}
.gold-btn-mobile:active {
    background-color: #d4af37;
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
    .desktop-only {
        display: none;
    }
    .mobile-only {
        display: block;
    }
    .sub-title {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
    }
}

/* Mobile Card Styles */
.mobile-order-card {
    margin-bottom: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.order-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
    margin-bottom: 12px;
}
.customer-info {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}
.email-small {
    font-size: 11px;
}
.ticket-type {
    margin-bottom: 4px;
}
.order-date {
    color: #bfbfbf;
    margin-bottom: 12px;
}
.order-card-footer {
    margin-top: 12px;
}

/* Search Customization (Theme) */
:deep(.ant-input-search-button) {
    background-color: #001529 !important;
    border-color: #001529 !important;
}
:deep(.ant-input-search-button:hover) {
    background-color: #d4af37 !important;
    border-color: #d4af37 !important;
}
</style>
