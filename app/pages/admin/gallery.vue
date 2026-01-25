<script setup>
import { 
    PlusOutlined, 
    DeleteOutlined, 
    PictureOutlined,
    SyncOutlined,
    CloudUploadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Layout & Meta
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการแกลเลอรี | Lanna Admin' })

// 2. Data Fetching
const { data: gallery, pending, refresh } = await useFetch('/api/gallery', {
    query: { limit: 100 },
})

// 3. States
const fileList = ref([])
const uploading = ref(false)

// 4. Upload Handler
const handleUpload = async () => {
    if (fileList.value.length === 0) return message.warning('กรุณาเลือกรูปภาพอย่างน้อย 1 รูป')

    const formData = new FormData()
    fileList.value.forEach((file) => {
        formData.append('images', file.originFileObj)
    })

    uploading.value = true
    try {
        await $fetch('/api/gallery/upload', {
            method: 'POST',
            body: formData,
        })
        message.success('อัปโหลดรูปภาพสำเร็จ')
        fileList.value = []
        refresh()
    } catch (err) {
        message.error('อัปโหลดไม่สำเร็จ: ' + (err.statusMessage || err.message))
    } finally {
        uploading.value = false
    }
}

// 5. Delete Handler
const handleDelete = (id) => {
    Modal.confirm({
        title: 'ยืนยันการลบรูปภาพ?',
        content: 'รูปภาพนี้จะถูกนำออกจากหน้าเว็บไซต์และไม่สามารถกู้คืนได้',
        okText: 'ลบรูปภาพ',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        centered: true,
        onOk: async () => {
            try {
                await $fetch(`/api/gallery/${id}`, { method: 'DELETE' })
                message.success('ลบรูปภาพสำเร็จ')
                refresh()
            } catch (err) {
                message.error('ลบไม่สำเร็จ')
            }
        },
    })
}
</script>

<template>
    <div style="padding: 24px">
        <a-flex justify="space-between" align="center" style="margin-bottom: 24px">
            <div>
                <a-typography-title :level="2" style="margin: 0">
                    <PictureOutlined style="margin-right: 12px; color: #d4af37" /> จัดการแกลเลอรี
                </a-typography-title>
                <a-typography-text type="secondary">จัดการรูปภาพบรรยากาศงานเพื่อแสดงผลที่หน้าหลัก</a-typography-text>
            </div>
            <a-space>
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
            </a-space>
        </a-flex>

        <a-card :bordered="false" class="shadow-sm" style="margin-bottom: 24px">
            <template #title>
                <a-space><CloudUploadOutlined /> <span>อัปโหลดรูปภาพใหม่</span></a-space>
            </template>
            
            <a-upload-dragger
                v-model:file-list="fileList"
                name="images"
                :multiple="true"
                :before-upload="() => false"
                accept="image/*"
            >
                <p class="ant-upload-drag-icon">
                    <picture-outlined style="color: #d4af37" />
                </p>
                <p class="ant-upload-text">คลิกหรือลากไฟล์รูปภาพมาวางที่นี่เพื่ออัปโหลด</p>
                <p class="ant-upload-hint">รองรับการอัปโหลดครั้งละหลายรูป ขนาดไม่เกิน 5MB ต่อไฟล์</p>
            </a-upload-dragger>

            <a-flex justify="end" style="margin-top: 16px">
                <a-button
                    type="primary"
                    size="large"
                    class="gold-btn"
                    :loading="uploading"
                    :disabled="fileList.length === 0"
                    @click="handleUpload"
                >
                    <template #icon><PlusOutlined /></template> เริ่มการอัปโหลด
                </a-button>
            </a-flex>
        </a-card>

        <a-card :bordered="false" class="shadow-sm" title="รูปภาพทั้งหมดในแกลเลอรี">
            <div v-if="pending" style="padding: 40px 0; text-align: center">
                <a-spin size="large" />
            </div>

            <div v-else-if="gallery?.length > 0">
                <a-row :gutter="[16, 16]">
                    <a-col v-for="img in gallery" :key="img.id" :xs="12" :sm="8" :md="6" :lg="4">
                        <div class="gallery-item-admin">
                            <img :src="img.url" class="thumbnail" alt="gallery" />
                            <div class="item-actions">
                                <a-button type="primary" danger shape="circle" @click="handleDelete(img.id)">
                                    <template #icon><delete-outlined /></template>
                                </a-button>
                            </div>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <a-empty v-else description="ยังไม่มีรูปภาพในแกลเลอรี" />
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.gold-btn {
    background-color: #001529;
    border: none;
    height: 40px;
    padding: 0 24px;
    
    &:hover {
        background-color: #d4af37 !important;
        color: #001529 !important;
    }
    
    &:disabled {
        background-color: #f5f5f5;
    }
}

.gallery-item-admin {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    aspect-ratio: 1 / 1;
    background: #fafafa;

    .thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    &:hover .thumbnail {
        transform: scale(1.1);
    }

    .item-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 15, 30, 0.6); // สีน้ำเงินเข้มจางๆ
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
        backdrop-filter: blur(2px);
    }

    &:hover .item-actions {
        opacity: 1;
    }
}

// ปรับสี Table Header (ถ้ามีใช้)
:deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 700;
}
</style>