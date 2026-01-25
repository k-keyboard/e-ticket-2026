<script setup>
import {
    SyncOutlined,
    EditOutlined,
    PlusOutlined,
    MinusOutlined,
    TagsOutlined,
    DeleteOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Layout & Meta
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการตั๋ว | Lanna Admin' })

// 2. Data Fetching
const { data: tickets, pending, refresh } = await useFetch('/api/tickets')

// 3. States สำหรับ UI และ Modal
const syncing = ref(false)
const isStockModalOpen = ref(false)
const stockLoading = ref(false)
const selectedTicket = ref(null)
const stockAdjustment = ref(0)

// 4. Computed: คำนวณสต็อกสุทธิ (ป้องกันค่าติดลบ)
const finalStock = computed(() => {
    if (!selectedTicket.value) return 0
    const result = selectedTicket.value.stock_quantity + (stockAdjustment.value || 0)
    return result < 0 ? 0 : result
})

// 5. ฟังก์ชัน Sync ข้อมูลจาก Stripe
const handleSync = async () => {
    syncing.value = true
    try {
        await $fetch('/api/tickets/sync', { method: 'POST' })
        message.success('ซิงค์ข้อมูลและตรวจสอบความถูกต้องจาก Stripe สำเร็จ')
        refresh()
    } catch (e) {
        message.error('ไม่สามารถซิงค์ข้อมูลได้')
    } finally {
        syncing.value = false
    }
}

// 6. ฟังก์ชัน Soft Delete (ลบโดย Admin)
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบตั๋ว?',
        content:
            'ตั๋วนี้จะถูกระงับการขายและสถานะจะถูกเปลี่ยนเป็น "ไม่มีใน Stripe" (ข้อมูลยังคงอยู่ในระบบเพื่อการตรวจสอบ)',
        okText: 'ลบตั๋ว',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            try {
                await $fetch(`/api/tickets/${id}`, { method: 'DELETE' })
                message.success('ลบตั๋วเรียบร้อยแล้ว')
                refresh()
            } catch (e) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}

// 7. การจัดการ Stock Modal
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
        message.success(`อัปเดตสต็อกเรียบร้อยแล้ว`)
        isStockModalOpen.value = false
        refresh()
    } catch (e) {
        message.error('อัปเดตสต็อกล้มเหลว')
    } finally {
        stockLoading.value = false
    }
}

// 8. เปลี่ยนสถานะการขาย (Toggle Switch)
const toggleStatus = async (record, checked) => {
    const newStatus = checked ? 'active' : 'suspended'
    const oldStatus = record.is_active
    record.is_active = newStatus
    try {
        await $fetch(`/api/tickets/${record.id}`, {
            method: 'PATCH',
            body: {
                stock_quantity: record.stock_quantity,
                is_active: newStatus,
            },
        })
        message.success(`สถานะตั๋ว: ${checked ? 'เปิดการขาย' : 'ระงับการขาย'}`)
    } catch (e) {
        record.is_active = oldStatus
        message.error('ไม่สามารถเปลี่ยนสถานะได้')
    }
}

// 9. Table Columns
const columns = [
    { title: 'ชื่อตั๋ว', key: 'name' },
    { title: 'ราคา', key: 'price', width: 150 },
    { title: 'สต็อกปัจจุบัน', key: 'stock', width: 150, align: 'center' },
    { title: 'สถานะการขาย', key: 'status', width: 150, align: 'center' },
    { title: 'จัดการ', key: 'action', width: 100, align: 'center' },
]
</script>

<template>
    <div style="padding: 24px">
        <a-flex justify="space-between" align="center" style="margin-bottom: 24px">
            <div>
                <a-typography-title :level="2" style="margin: 0">
                    <TagsOutlined style="margin-right: 12px; color: #d4af37" /> จัดการตั๋ว
                </a-typography-title>
                <a-typography-text type="secondary"
                    >ซิงค์ราคาจาก Stripe และควบคุมสต็อกตั๋ว (รายการที่ขีดฆ่าคือถูกลบจาก Stripe แล้ว)</a-typography-text
                >
            </div>
            <a-space>
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
                <a-button type="primary" size="large" :loading="syncing" @click="handleSync" class="gold-btn">
                    <template #icon><SyncOutlined /></template> ซิงค์จาก Stripe
                </a-button>
            </a-space>
        </a-flex>

        <a-card :bordered="false" class="shadow-sm">
            <a-table :columns="columns" :data-source="tickets" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <a-space>
                            <a-typography-text
                                :strong="!record.deleted_at"
                                :delete="record.deleted_at !== null"
                                :type="record.deleted_at ? 'secondary' : ''"
                            >
                                {{ record.name }}
                            </a-typography-text>
                            <a-tag v-if="record.deleted_at" color="error">ไม่มีใน Stripe</a-tag>
                        </a-space>
                    </template>

                    <template v-else-if="column.key === 'price'">
                        <a-typography-text strong style="font-size: 16px">
                            {{ record.price.toLocaleString() }}
                        </a-typography-text>
                        <a-typography-text type="secondary" style="margin-left: 4px; font-size: 11px">
                            {{ record.currency.toUpperCase() }}
                        </a-typography-text>
                    </template>

                    <template v-else-if="column.key === 'stock'">
                        <a-button
                            type="dashed"
                            block
                            :disabled="record.deleted_at !== null"
                            @click="openStockModal(record)"
                            style="height: auto; padding: 4px 0"
                        >
                            <a-typography-text
                                strong
                                :type="record.stock_quantity <= 5 ? 'danger' : 'success'"
                                style="font-size: 18px"
                            >
                                {{ record.stock_quantity }}
                            </a-typography-text>
                            <EditOutlined v-if="!record.deleted_at" style="margin-left: 8px; color: #bfbfbf" />
                        </a-button>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-switch
                            :checked="record.is_active === 'active'"
                            :disabled="record.deleted_at !== null"
                            checked-children="เปิดขาย"
                            un-checked-children="ปิด"
                            @change="(val) => toggleStatus(record, val)"
                        />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-button
                            v-if="record.deleted_at === null"
                            size="small"
                            danger
                            @click="handleDelete(record.id)"
                        >
                            <template #icon><DeleteOutlined /></template>
                        </a-button>
                        <a-typography-text v-else type="secondary">-</a-typography-text>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal v-model:open="isStockModalOpen" :closable="false" :footer="null" :width="400" centered>
            <div style="text-align: center; padding: 24px 0">
                <a-typography-title :level="4" style="margin-bottom: 4px">
                    {{ selectedTicket?.name }}
                </a-typography-title>
                <a-typography-text type="secondary"
                    >ปรับปรุงสต็อก (สต็อกเริ่มต้น: {{ selectedTicket?.stock_quantity }})</a-typography-text
                >

                <div style="margin: 32px 0">
                    <a-statistic
                        title="สต็อกใหม่ที่จะบันทึก"
                        :value="finalStock"
                        :value-style="{ color: '#d4af37', fontSize: '48px', fontWeight: 'bold' }"
                    />
                </div>

                <a-flex justify="center" align="center" :gap="16">
                    <a-button type="primary" shape="circle" size="large" danger @click="stockAdjustment--">
                        <template #icon><MinusOutlined /></template>
                    </a-button>
                    <a-input-number
                        v-model:value="stockAdjustment"
                        size="large"
                        :controls="false"
                        style="width: 100px; text-align: center; font-size: 20px; font-weight: bold"
                    />
                    <a-button
                        type="primary"
                        shape="circle"
                        size="large"
                        style="background: #52c41a; border-color: #52c41a"
                        @click="stockAdjustment++"
                    >
                        <template #icon><PlusOutlined /></template>
                    </a-button>
                </a-flex>

                <a-flex :gap="12" justify="center" style="margin-top: 40px">
                    <a-button size="large" @click="isStockModalOpen = false" style="width: 120px">ยกเลิก</a-button>
                    <a-button
                        type="primary"
                        size="large"
                        class="gold-btn"
                        style="width: 120px"
                        :loading="stockLoading"
                        @click="handleSaveStock"
                    >
                        บันทึก
                    </a-button>
                </a-flex>
            </div>
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
