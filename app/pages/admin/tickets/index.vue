<script setup>
import {
    SyncOutlined,
    EditOutlined,
    PlusOutlined,
    MinusOutlined,
    TagsOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Layout & Meta
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการตั๋ว | Lanna Admin' })

// 2. Data Fetching
const {
    data: tickets,
    pending,
    refresh,
} = await useFetch('/api/tickets', {
    onResponse({ response }) {
        if (response._data) {
            response._data.forEach((item) => {
                item.checkedStatus = item.is_active === 'active'
                item.loading = false
            })
        }
    },
})

// 3. States
const syncing = ref(false)
const isStockModalOpen = ref(false)
const stockLoading = ref(false)
const selectedTicket = ref(null)
const stockAdjustment = ref(0)

// 4. Computed: คำนวณสต็อก
const finalStock = computed(() => {
    if (!selectedTicket.value) return 0
    const result = selectedTicket.value.stock_quantity + (stockAdjustment.value || 0)
    return result < 0 ? 0 : result
})

// 5. Functions
const handleSync = async () => {
    syncing.value = true
    try {
        await $fetch('/api/tickets/sync', { method: 'POST' })
        message.success('ซิงค์ข้อมูลสำเร็จ')
        refresh()
    } catch (e) {
        message.error('ไม่สามารถซิงค์ข้อมูลได้')
    } finally {
        syncing.value = false
    }
}

const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบทิ้ง?',
        icon: h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' }),
        content: 'รายการนี้ไม่มีอยู่บน Stripe แล้ว',
        okText: 'ยืนยันการลบ',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            try {
                await $fetch(`/api/tickets/${id}`, { method: 'DELETE' })
                message.success('ลบเรียบร้อยแล้ว')
                refresh()
            } catch (e) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

const openStockModal = (record) => {
    selectedTicket.value = { ...record }
    stockAdjustment.value = 0
    isStockModalOpen.value = true
}

const handleSaveStock = async () => {
    if (!selectedTicket.value) return
    stockLoading.value = true
    try {
        await $fetch(`/api/tickets/${selectedTicket.value.id}`, {
            method: 'PATCH',
            body: {
                stock_quantity: finalStock.value,
                is_active: selectedTicket.value.is_active,
            },
        })
        message.success(`อัปเดตสต็อกเรียบร้อย`)
        isStockModalOpen.value = false
        refresh()
    } catch (e) {
        message.error('อัปเดตล้มเหลว')
    } finally {
        stockLoading.value = false
    }
}

const toggleStatus = async (record, checked) => {
    record.loading = true
    const newStatus = checked ? 'active' : 'suspended'
    try {
        await $fetch(`/api/tickets/${record.id}`, {
            method: 'PATCH',
            body: { stock_quantity: record.stock_quantity, is_active: newStatus },
        })
        message.success(checked ? 'เปิดขายแล้ว' : 'ปิดการขายแล้ว')
        await refresh()
    } catch (e) {
        record.checkedStatus = !checked
        message.error('เปลี่ยนสถานะไม่ได้')
    } finally {
        record.loading = false
    }
}

// 9. Table Columns (ซ่อนบางคอลัมน์ในจอเล็ก)
const columns = [
    { title: 'ชื่อตั๋ว', key: 'name' },
    { title: 'ราคา', key: 'price', width: 120 },
    { title: 'สต็อก', key: 'stock', width: 100, align: 'center' },
    { title: 'สถานะ', key: 'status', width: 100, align: 'center' },
    { title: 'จัดการ', key: 'action', width: 80, align: 'center', responsive: ['md'] }, // ซ่อนในมือถือเพราะใส่ในการ์ดแทนได้
]
</script>

<template>
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <TagsOutlined class="icon-gold" /> จัดการตั๋ว
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    ระบบจะรักษาจำนวนสต็อกเดิมไว้เมื่อซิงค์ข้อมูล
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <a-button type="primary" :loading="syncing" @click="handleSync" class="gold-btn">
                    <template #icon><SyncOutlined /></template> ซิงค์ Stripe
                </a-button>
            </a-space>
        </div>

        <a-card :bordered="false" class="shadow-sm desktop-only">
            <a-table :columns="columns" :data-source="tickets" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <a-space>
                            <a-typography-text
                                :strong="!record.deleted_at"
                                :delete="!!record.deleted_at"
                                :type="record.deleted_at ? 'secondary' : ''"
                            >
                                {{ record.name }}
                            </a-typography-text>
                            <a-tag v-if="record.deleted_at" color="error">Mismatch</a-tag>
                        </a-space>
                    </template>

                    <template v-else-if="column.key === 'price'">
                        <a-typography-text strong>{{ record.price.toLocaleString() }}</a-typography-text>
                        <small style="margin-left: 4px">{{ record.currency.toUpperCase() }}</small>
                    </template>

                    <template v-else-if="column.key === 'stock'">
                        <a-button
                            type="dashed"
                            block
                            :disabled="!!record.deleted_at"
                            @click="openStockModal(record)"
                            class="stock-btn"
                        >
                            <span :class="record.stock_quantity <= 5 ? 'text-danger' : 'text-success'">{{
                                record.stock_quantity
                            }}</span>
                            <EditOutlined v-if="!record.deleted_at" />
                        </a-button>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-switch
                            v-model:checked="record.checkedStatus"
                            :disabled="!!record.deleted_at"
                            :loading="record.loading"
                            @change="(val) => toggleStatus(record, val)"
                        />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-button v-if="record.deleted_at" size="small" danger @click="handleDelete(record.id)"
                            >ลบตกค้าง</a-button
                        >
                        <span v-else class="text-muted">สมบูรณ์</span>
                    </template>
                </template>
            </a-table>
        </a-card>

        <div class="mobile-only">
            <a-list :loading="pending" :data-source="tickets">
                <template #renderItem="{ item }">
                    <a-card class="mobile-ticket-card" :class="{ 'mismatch-card': item.deleted_at }">
                        <div class="card-header">
                            <a-typography-text strong>{{ item.name }}</a-typography-text>
                            <a-switch
                                v-model:checked="item.checkedStatus"
                                size="small"
                                :disabled="!!item.deleted_at"
                                :loading="item.loading"
                                @change="(val) => toggleStatus(item, val)"
                            />
                        </div>

                        <div class="card-body">
                            <div class="info-row">
                                <span class="label">ราคา:</span>
                                <span>{{ item.price.toLocaleString() }} {{ item.currency.toUpperCase() }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">สต็อก:</span>
                                <a-tag
                                    :color="item.stock_quantity <= 5 ? 'red' : 'green'"
                                    @click="openStockModal(item)"
                                >
                                    {{ item.stock_quantity }} รายการ <EditOutlined />
                                </a-tag>
                            </div>
                        </div>

                        <div v-if="item.deleted_at" class="card-footer">
                            <a-button block danger size="small" @click="handleDelete(item.id)">
                                <DeleteOutlined /> ลบข้อมูลตกค้าง
                            </a-button>
                        </div>
                    </a-card>
                </template>
            </a-list>
        </div>

        <a-modal v-model:open="isStockModalOpen" :closable="false" :footer="null" :width="400" centered>
            <div v-if="selectedTicket" class="stock-modal-content" style="padding: 20px; text-align: center">
                <a-typography-title :level="4">ปรับปรุงสต็อก</a-typography-title>
                <a-typography-text type="secondary">{{ selectedTicket.name }}</a-typography-text>

                <div style="margin: 30px 0; display: flex; align-items: center; justify-content: center; gap: 20px">
                    <a-button shape="circle" size="large" @click="stockAdjustment--">
                        <template #icon><MinusOutlined /></template>
                    </a-button>

                    <div style="text-align: center">
                        <div style="font-size: 12px; color: #8c8c8c">จำนวนสต็อกที่จะเป็น</div>
                        <div
                            style="font-size: 32px; font-weight: bold"
                            :class="finalStock <= 5 ? 'text-danger' : 'text-success'"
                        >
                            {{ finalStock }}
                        </div>
                        <div v-if="stockAdjustment !== 0" style="font-size: 14px; color: #d4af37">
                            ({{ stockAdjustment > 0 ? '+' : '' }}{{ stockAdjustment }})
                        </div>
                    </div>

                    <a-button shape="circle" size="large" @click="stockAdjustment++">
                        <template #icon><PlusOutlined /></template>
                    </a-button>
                </div>

                <a-space direction="vertical" style="width: 100%" size="middle">
                    <a-button
                        type="primary"
                        block
                        size="large"
                        :loading="stockLoading"
                        @click="handleSaveStock"
                        style="background: #001529"
                    >
                        ยืนยันการเปลี่ยนสต็อก
                    </a-button>
                    <a-button block @click="isStockModalOpen = false">ยกเลิก</a-button>
                </a-space>
            </div>
        </a-modal>
    </div>
</template>

<style scoped>
/* Layout Styles */
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

/* Mobile Card Custom Design */
.mobile-ticket-card {
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
}
.mismatch-card {
    border-left: 4px solid #ff4d4f;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}
.label {
    color: #8c8c8c;
}

/* Common Styles */
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.gold-btn {
    background-color: #001529;
    border: none;
}
.text-danger {
    color: #ff4d4f;
    font-weight: bold;
    font-size: 16px;
}
.text-success {
    color: #52c41a;
    font-weight: bold;
    font-size: 16px;
}
.stock-btn {
    height: auto;
    padding: 4px 0;
}
</style>
