<script setup>
import { 
    MailOutlined, 
    ReloadOutlined, 
    ClockCircleOutlined,
    UserOutlined,
    FileTextOutlined
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
    return orders.value.filter(order => 
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
            body: { orderId }
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
    <div style="padding: 24px">
        <a-flex justify="space-between" align="center" style="margin-bottom: 24px">
            <div>
                <a-typography-title :level="2" style="margin: 0">
                    <FileTextOutlined style="margin-right: 12px; color: #d4af37" /> จัดการคำสั่งซื้อ
                </a-typography-title>
                <a-typography-text type="secondary">ตรวจสอบประวัติการชำระเงินและจัดการส่งตั๋วซ้ำ</a-typography-text>
            </div>
            <a-space>
                <a-button @click="refresh" :loading="pending">
                    <template #icon><ReloadOutlined /></template>
                </a-button>
            </a-space>
        </a-flex>

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

        <a-card :bordered="false" class="shadow-sm">
            <a-table 
                :columns="columns" 
                :data-source="filteredOrders" 
                :loading="pending" 
                row-key="id"
                :pagination="{ 
                    pageSize: 10, 
                    showTotal: (total) => `ทั้งหมด ${total} รายการ`,
                    showSizeChanger: true 
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
                        <a-tag color="gold" style="font-family: monospace; font-weight: bold; padding: 0 8px">
                            {{ record.ticket_code }}
                        </a-tag>
                    </template>

                    <template v-else-if="column.key === 'customer'">
                        <a-space direction="vertical" :size="0">
                            <a-typography-text strong>
                                <UserOutlined style="margin-right: 4px; color: #bfbfbf" />
                                {{ record.customer_name }}
                            </a-typography-text>
                            <a-typography-text type="secondary" style="font-size: 12px; margin-left: 20px">
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
    </div>
</template>

<style scoped>
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.gold-btn {
    background-color: #d4af37;
    border-color: #d4af37;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.gold-btn:hover {
    background-color: #b8962d !important;
    border-color: #b8962d !important;
}

/* ปรับแต่งปุ่มค้นหาให้เข้าธีมน้ำเงิน-ทอง */
:deep(.ant-input-search-button) {
    background-color: #001529 !important;
    border-color: #001529 !important;
}

:deep(.ant-input-search-button:hover) {
    background-color: #d4af37 !important;
    border-color: #d4af37 !important;
}

:deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 700;
}
</style>