<script setup>
import { SyncOutlined, EditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'admin' })

// 1. ดึงข้อมูลตั๋ว
const { data: tickets, pending, refresh } = await useFetch('/api/tickets')

// 2. State สำหรับ Sync และ UI
const syncing = ref(false)
const isStockModalOpen = ref(false)
const stockLoading = ref(false)
const selectedTicket = ref(null)
const stockAdjustment = ref(0)

// 3. คำนวณสต็อกสุทธิ (Prevent Negative)
const finalStock = computed(() => {
    if (!selectedTicket.value) return 0
    const result = selectedTicket.value.stock_quantity + (stockAdjustment.value || 0)
    return result < 0 ? 0 : result
})

// 4. ฟังก์ชันซิงค์จาก Stripe
const handleSync = async () => {
    syncing.value = true
    try {
        await $fetch('/api/tickets/sync', { method: 'POST' })
        message.success('ซิงค์ข้อมูลจาก Stripe สำเร็จ')
        refresh()
    } catch (e) {
        message.error('ไม่สามารถซิงค์ข้อมูลได้')
    } finally {
        syncing.value = false
    }
}

// 5. จัดการสต็อก Modal
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
        message.success(`อัปเดตสต็อก ${selectedTicket.value.name} เป็น ${finalStock.value}`)
        isStockModalOpen.value = false
        refresh() // โหลดข้อมูลใหม่เพื่อให้ตารางอัปเดต
    } catch (e) {
        message.error('อัปเดตสต็อกล้มเหลว')
    } finally {
        stockLoading.value = false
    }
}

// 6. เปลี่ยนสถานะการขาย (Toggle Switch)
const toggleStatus = async (record, checked) => {
    const newStatus = checked ? 'active' : 'suspended'
    const oldStatus = record.is_active

    record.is_active = newStatus // Optimistic Update
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

const columns = [
    { title: 'ชื่อตั๋ว', dataIndex: 'name', key: 'name' },
    { title: 'ราคา', key: 'price', width: '150px' },
    { title: 'สต็อกปัจจุบัน', key: 'stock', width: '150px', align: 'center' },
    { title: 'สถานะการขาย', key: 'status', width: '150px', align: 'center' },
]
</script>

<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold">จัดการตั๋ว (Tickets Management)</h1>
                <p class="text-gray-500">ซิงค์ราคาจาก Stripe และคุมสต็อกที่นี่</p>
            </div>
            <a-button type="primary" :loading="syncing" @click="handleSync">
                <template #icon><SyncOutlined /></template> ซิงค์จาก Stripe
            </a-button>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-table :columns="columns" :data-source="tickets" :loading="pending" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'price'">
                        <span class="font-semibold">{{ record.price.toLocaleString() }}</span>
                        <span class="ml-1 text-xs text-gray-400">{{ record.currency.toUpperCase() }}</span>
                    </template>

                    <template v-else-if="column.key === 'stock'">
                        <a-button type="dashed" block @click="openStockModal(record)">
                            <span
                                class="font-bold text-lg"
                                :class="record.stock_quantity <= 5 ? 'text-red-500' : 'text-green-600'"
                            >
                                {{ record.stock_quantity }}
                            </span>
                            <EditOutlined class="ml-2 text-gray-400" />
                        </a-button>
                    </template>

                    <template v-else-if="column.key === 'status'">
                        <a-switch
                            :checked="record.is_active === 'active'"
                            checked-children="เปิดขาย"
                            un-checked-children="ปิด"
                            @change="(val) => toggleStatus(record, val)"
                        />
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal v-model:open="isStockModalOpen" :closable="false" :footer="null" :width="400" centered>
            <div style="text-align: center; padding: 20px 0">
                <a-typography-title :level="3" style="margin-bottom: 4px">
                    {{ selectedTicket?.name }}
                </a-typography-title>
                <a-typography-text type="secondary">ปรับปรุงจำนวนสต็อกสินค้า</a-typography-text>

                <div style="margin: 40px 0">
                    <a-statistic
                        title="สต็อกใหม่จะกลายเป็น"
                        :value="finalStock"
                        :value-style="{ color: '#1890ff', fontSize: '48px', fontWeight: 'bold' }"
                    />
                </div>

                <div style="display: flex; justify-content: center; align-items: center; gap: 12px">
                    <a-button type="primary" shape="circle" size="large" danger @click="stockAdjustment--">
                        <template #icon><MinusOutlined /></template>
                    </a-button>

                    <a-input-number
                        v-model:value="stockAdjustment"
                        size="large"
                        :controls="false"
                        style="width: 120px; text-align: center; font-size: 18px"
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
                </div>

                <div
                    v-if="selectedTicket && selectedTicket.stock_quantity + stockAdjustment < 0"
                    style="margin-top: 16px"
                >
                    <a-typography-text type="danger">⚠️ สต็อกจะถูกปรับเป็น 0</a-typography-text>
                </div>

                <div style="margin-top: 40px; display: flex; gap: 12px; justify-content: center">
                    <a-button size="large" style="width: 120px" @click="isStockModalOpen = false"> ยกเลิก </a-button>
                    <a-button
                        type="primary"
                        size="large"
                        style="width: 120px"
                        :loading="stockLoading"
                        @click="handleSaveStock"
                    >
                        บันทึก
                    </a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>
