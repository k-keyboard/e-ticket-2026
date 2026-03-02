<script setup>
import { PlusOutlined, DeleteOutlined, PictureOutlined, SyncOutlined, CloudUploadOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// 1. Setup Layout & Meta
definePageMeta({ layout: 'admin' })
useHead({ title: 'จัดการแกลเลอรี | Lanna Admin' })

// 2. Data Fetching
const {
    data: gallery,
    pending,
    refresh,
} = await useFetch('/api/gallery', {
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
    <div class="admin-container">
        <div class="header-wrapper">
            <div class="header-content">
                <a-typography-title :level="2" class="title-text">
                    <PictureOutlined class="icon-gold" /> จัดการแกลเลอรี
                </a-typography-title>
                <a-typography-text type="secondary" class="sub-title">
                    จัดการรูปภาพบรรยากาศงานเพื่อแสดงผลที่หน้าหลัก
                </a-typography-text>
            </div>
            <a-space class="header-actions">
                <a-button @click="refresh" :loading="pending">
                    <template #icon><SyncOutlined /></template>
                </a-button>
            </a-space>
        </div>

        <a-card :bordered="false" class="shadow-sm upload-card">
            <template #title>
                <a-space><CloudUploadOutlined /> <span>อัปโหลดรูปภาพใหม่</span></a-space>
            </template>

            <a-upload-dragger
                v-model:file-list="fileList"
                name="images"
                :multiple="true"
                :before-upload="() => false"
                accept="image/*"
                class="responsive-dragger"
            >
                <p class="ant-upload-drag-icon">
                    <picture-outlined class="icon-gold-thin" />
                </p>
                <p class="ant-upload-text">คลิกหรือลากไฟล์รูปภาพมาวางที่นี่</p>
                <p class="ant-upload-hint desktop-only">รองรับการอัปโหลดครั้งละหลายรูป ขนาดไม่เกิน 5MB ต่อไฟล์</p>
            </a-upload-dragger>

            <div class="upload-actions">
                <a-button
                    type="primary"
                    size="large"
                    class="gold-btn"
                    :loading="uploading"
                    :disabled="fileList.length === 0"
                    @click="handleUpload"
                    block
                >
                    <template #icon><PlusOutlined /></template> เริ่มการอัปโหลด ({{ fileList.length }})
                </a-button>
            </div>
        </a-card>

        <a-card :bordered="false" class="shadow-sm gallery-list-card" title="รูปภาพทั้งหมดในแกลเลอรี">
            <div v-if="pending" class="loading-state">
                <a-spin size="large" />
            </div>

            <div v-else-if="gallery?.length > 0">
                <a-row :gutter="[12, 12]">
                    <a-col v-for="img in gallery" :key="img.id" :xs="8" :sm="8" :md="6" :lg="4">
                        <div class="gallery-item-admin">
                            <img :src="img.url" class="thumbnail" alt="gallery" />
                            <div class="item-actions">
                                <a-button
                                    type="primary"
                                    danger
                                    shape="circle"
                                    size="small"
                                    @click="handleDelete(img.id)"
                                >
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
// Common Layout
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

.icon-gold-thin {
    color: #d4af37;
}

.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

// Upload Component
.upload-card {
    margin-bottom: 24px;

    .upload-actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }
}

.gold-btn {
    background-color: #001529;
    border: none;
    height: 44px;
    padding: 0 32px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
        background-color: #d4af37 !important;
        color: #001529 !important;
    }

    &:disabled {
        background-color: #f5f5f5;
        color: rgba(0, 0, 0, 0.25);
    }
}

// Gallery Grid
.gallery-item-admin {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    aspect-ratio: 1 / 1;
    background: #fafafa;

    .thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
    }

    .item-actions {
        position: absolute;
        inset: 0;
        background: rgba(0, 15, 30, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
        backdrop-filter: blur(1px);
    }

    // บน Desktop ให้โชว์เมื่อ Hover
    @media (min-width: 769px) {
        &:hover {
            .thumbnail {
                transform: scale(1.1);
            }
            .item-actions {
                opacity: 1;
            }
        }
    }

    // บน Mobile ให้เห็นปุ่มลบได้ง่ายขึ้น หรือเห็นตลอดไปเลย
    @media (max-width: 768px) {
        .item-actions {
            opacity: 1;
            background: transparent;
            align-items: flex-end;
            justify-content: flex-end;
            padding: 4px;
            pointer-events: none; // ให้คลิกผ่านไปที่รูปได้ (ถ้ามี)

            button {
                pointer-events: auto; // แต่ตัวปุ่มต้องกดได้
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
        }
    }
}

.loading-state {
    padding: 60px 0;
    text-align: center;
}

// Responsive Logic
@media (max-width: 768px) {
    .admin-container {
        padding: 16px;
    }

    .header-wrapper {
        flex-direction: column;
        gap: 12px;
    }

    .header-actions {
        width: 100%;
        .ant-btn {
            width: 100%;
        }
    }

    .sub-title {
        display: block;
        font-size: 12px;
    }

    .desktop-only {
        display: none;
    }

    .upload-card .upload-actions {
        width: 100%;
    }

    // ปรับ Grid ในมือถือให้เห็นแถวละ 3 รูป (xs=8)
    :deep(.ant-row) {
        margin-left: -6px !important;
        margin-right: -6px !important;
    }
    :deep(.ant-col) {
        padding-left: 6px !important;
        padding-right: 6px !important;
    }
}
</style>
