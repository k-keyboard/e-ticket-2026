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
const { data: tickets, pending, refresh } = await useFetch('/api/tickets', {
    onResponse({ response }) {
        if (response._data) {
            // สร้าง Property ใหม่เพื่อให้ v-model ทำงานได้ลื่นไหล
            response._data.forEach(item => {
                item.checkedStatus = item.is_active === 'active'
                item.loading = false
            })
        }
    }
})

// 3. States สำหรับ UI และ Modal
const syncing = ref(false)
const isStockModalOpen = ref(false)
const stockLoading = ref(false)
const selectedTicket = ref(null)
const stockAdjustment = ref(0)

// 4. Computed: คำนวณสต็อกสุทธิ
const finalStock = computed(() => {
    if (!selectedTicket.value) return 0
    const result = selectedTicket.value.stock_quantity + (stockAdjustment.value || 0)
    return result < 0 ? 0 : result
})

// 5. ฟังก์ชัน Sync ข้อมูล (เน้นย้ำความปลอดภัยของสต็อก)
const handleSync = async () => {
    syncing.value = true
    try {
        // แนะนำ: API ฝั่ง Server ควรมี Logic:
        // IF ticket_exists THEN update_price_only ELSE create_new_and_set_stock_0
        await $fetch('/api/tickets/sync', { method: 'POST' })
        message.success('ซิงค์ข้อมูลสำเร็จ (คงสต็อกรายการเดิมไว้เรียบร้อย)')
        refresh()
    } catch (e) {
        message.error('ไม่สามารถซิงค์ข้อมูลได้')
    } finally {
        syncing.value = false
    }
}

// 6. ฟังก์ชัน Soft Delete (ลบเฉพาะรายการที่ Sync แล้วไม่พบใน Stripe)
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบทิ้งจากระบบ?',
        icon: h(ExclamationCircleOutlined, { style: 'color: #ff4d4f' }),
        content: 'รายการนี้ไม่มีอยู่บน Stripe แล้ว การลบจะเป็นการ Soft Delete เพื่อไม่ให้แสดงในหน้าจัดการอีก',
        okText: 'ยืนยันการลบ',
        okType: 'danger',
        centered: true,
        onOk: async () => {
            try {
                // เรียก API Delete (ควรเขียน Logic ใน Backend ให้ set deleted_at หรือลบถาวรตามต้องการ)
                await $fetch(`/api/tickets/${id}`, { method: 'DELETE' })
                message.success('ลบข้อมูลที่ตกค้างเรียบร้อยแล้ว')
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

// 8. เปลี่ยนสถานะการขาย (ปรับปรุงเพื่อให้ UI อัพเดททันที)
const toggleStatus = async (record, checked) => {
    record.loading = true
    const newStatus = checked ? 'active' : 'suspended'
    
    try {
        await $fetch(`/api/tickets/${record.id}`, {
            method: 'PATCH',
            body: {
                stock_quantity: record.stock_quantity,
                is_active: newStatus,
            },
        })
        
        message.success(checked ? 'เปิดขายรายการนี้ และปิดรายการอื่นแล้ว' : 'ปิดการขายเรียบร้อย')
        
        // สำคัญมาก: ต้อง refresh ข้อมูลทั้งหมด 
        // เพื่อให้ Switch ของตั๋วใบอื่นเด้งกลับเป็น "ปิด" (UI Sync)
        await refresh() 
        
    } catch (e) {
        // หาก Error ให้ดีด Switch กลับค่าเดิม
        record.checkedStatus = !checked
        message.error('ไม่สามารถเปลี่ยนสถานะได้')
    } finally {
        record.loading = false
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
                <a-typography-text type="secondary">
                    ระบบจะรักษาจำนวนสต็อกเดิมไว้เมื่อซิงค์ข้อมูล | รายการที่ข้อมูลไม่ตรงกับ Stripe จะปรากฏปุ่มลบ
                </a-typography-text>
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
                            <a-tooltip v-if="record.deleted_at" title="ข้อมูลนี้ไม่พบใน Stripe แล้ว">
                                <a-tag color="error">Mismatch</a-tag>
                            </a-tooltip>
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
                            v-model:checked="record.checkedStatus"
                            :disabled="record.deleted_at !== null"
                            :loading="record.loading"
                            checked-children="เปิดขาย"
                            un-checked-children="ปิด"
                            @change="(val) => toggleStatus(record, val)"
                        />
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <a-button
                            v-if="record.deleted_at !== null"
                            size="small"
                            danger
                            @click="handleDelete(record.id)"
                        >
                            <template #icon><DeleteOutlined /></template> ลบข้อมูลตกค้าง
                        </a-button>
                        <a-typography-text v-else type="secondary">สมบูรณ์</a-typography-text>
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
                    >ปรับปรุงสต็อก (สต็อกปัจจุบัน: {{ selectedTicket?.stock_quantity }})</a-typography-text
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
