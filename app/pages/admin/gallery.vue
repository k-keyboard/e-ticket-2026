<script setup>
import { PlusOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// ใช้ Layout Admin ที่เราสร้างไว้
definePageMeta({
    layout: 'admin',
})

// 1. ดึงข้อมูลรูปภาพ (ใช้ refresh เพื่อโหลดใหม่หลังอัพโหลดหรือลบ)
const {
    data: gallery,
    pending,
    refresh,
} = await useFetch('/api/gallery', {
    query: { limit: 100 }, // ดึงมาทั้งหมดเพื่อจัดการ
})

// 2. การอัพโหลดรูปภาพ
const fileList = ref([])
const uploading = ref(false)

const handleUpload = async () => {
    if (fileList.value.length === 0) {
        return message.warning('Please select at least one image')
    }

    const formData = new FormData()
    fileList.value.forEach((file) => {
        // ใช้คีย์ 'images' ให้ตรงกับ API ที่เราเขียนไว้
        formData.append('images', file.originFileObj)
    })

    uploading.value = true
    try {
        await $fetch('/api/gallery/upload', {
            method: 'POST',
            body: formData,
        })

        message.success('Uploaded successfully')
        fileList.value = [] // ล้างคิวการอัพโหลด
        refresh() // โหลดรูปใหม่
    } catch (err) {
        message.error('Upload failed: ' + (err.statusMessage || err.message))
    } finally {
        uploading.value = false
    }
}

// 3. การลบรูปภาพ
const handleDelete = (id) => {
    Modal.confirm({
        title: 'Are you sure you want to delete this image?',
        content: 'This action cannot be undone.',
        okText: 'Yes, Delete',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
            try {
                await $fetch(`/api/gallery/${id}`, {
                    method: 'DELETE',
                })
                message.success('Deleted successfully')
                refresh() // โหลดรูปใหม่
            } catch (err) {
                message.error('Delete failed')
            }
        },
    })
}
</script>

<template>
    <div class="admin-gallery-page">
        <div class="page-header">
            <div class="title-section">
                <h1 class="text-xl font-bold">Manage Atmosphere Gallery</h1>
                <p class="text-gray-500">Upload and manage images for the front-end display</p>
            </div>
        </div>

        <a-card title="Upload New Images" class="mb-6">
            <div class="upload-zone">
                <a-upload-dragger
                    v-model:file-list="fileList"
                    name="images"
                    :multiple="true"
                    :before-upload="() => false"
                    accept="image/*"
                >
                    <p class="ant-upload-drag-icon">
                        <picture-outlined />
                    </p>
                    <p class="ant-upload-text">Click or drag images to this area to upload</p>
                    <p class="ant-upload-hint">Support for single or bulk upload. Max size 5MB per image.</p>
                </a-upload-dragger>

                <div class="mt-4 flex justify-end">
                    <a-button
                        type="primary"
                        :loading="uploading"
                        :disabled="fileList.length === 0"
                        @click="handleUpload"
                    >
                        <plus-outlined /> Start Uploading
                    </a-button>
                </div>
            </div>
        </a-card>

        <a-card title="Gallery Images">
            <div v-if="pending" class="py-10 text-center">
                <a-spin size="large" />
            </div>

            <div v-else-if="gallery?.length > 0" class="gallery-grid">
                <div v-for="img in gallery" :key="img.id" class="gallery-item-admin">
                    <img :src="img.url" class="thumbnail" alt="gallery" />
                    <div class="item-actions">
                        <a-button type="primary" danger shape="circle" @click="handleDelete(img.id)">
                            <template #icon><delete-outlined /></template>
                        </a-button>
                    </div>
                </div>
            </div>

            <a-empty v-else description="No images found in gallery" />
        </a-card>
    </div>
</template>

<style scoped lang="scss">
.admin-gallery-page {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        h1 {
            margin: 0;
        }
    }

    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
    }

    .gallery-item-admin {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #eee;
        aspect-ratio: 1 / 1;

        .thumbnail {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }

        &:hover .thumbnail {
            transform: scale(1.05);
        }

        .item-actions {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s;
        }

        &:hover .item-actions {
            opacity: 1;
        }
    }

    .mb-6 {
        margin-bottom: 1.5rem;
    }
    .mt-4 {
        margin-top: 1rem;
    }
    .flex {
        display: flex;
    }
    .justify-end {
        justify-content: flex-end;
    }
}
</style>
