<script setup>
import { 
  SaveOutlined, 
  CloseOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const articleId = route.params.id

const formState = reactive({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
})

const fileList = ref([])
const loading = ref(false)
const fetching = ref(true)

// 1. ดึงข้อมูลเดิมมาแสดง
const fetchArticle = async () => {
    fetching.value = true
    try {
        const response = await $fetch(`/api/articles/${articleId}`)
        if (response.success) {
            const item = response.data
            formState.title = item.title
            formState.content = item.content
            formState.meta_title = item.meta_title
            formState.meta_description = item.meta_description
            formState.status = item.status
            
            // Map รูปภาพให้ตรงกับ Format ของ a-upload
            if (item.images && item.images.length > 0) {
                fileList.value = item.images.map((img) => ({
                    uid: img.id.toString(),
                    name: img.url.split('/').pop(),
                    status: 'done',
                    url: img.url, 
                }))
            }
        }
    } catch (e) {
        message.error('ไม่สามารถโหลดข้อมูลบทความได้')
        navigateTo('/admin/articles')
    } finally {
        fetching.value = false
    }
}

onMounted(fetchArticle)

// 2. ฟังก์ชันอัปเดตข้อมูล
const handleUpdate = async () => {
    if (!formState.title || !formState.content) {
        return message.error('กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน')
    }

    loading.value = true
    const body = new FormData()
    
    // ใส่ข้อมูลข้อความ
    Object.keys(formState).forEach((key) => body.append(key, formState[key]))
    
    // ใส่รูปภาพใหม่ (ถ้ามีการเพิ่ม)
    fileList.value.forEach((file) => {
        if (file.originFileObj) body.append('images', file.originFileObj)
    })

    try {
        await $fetch(`/api/articles/${articleId}`, { method: 'PUT', body })
        message.success('บันทึกการแก้ไขเรียบร้อยแล้ว')
        navigateTo('/admin/articles')
    } catch (e) {
        message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div style="padding: 24px;">
        <a-row justify="center">
            <a-col :span="24" :xl="18">
                
                <a-flex justify="space-between" align="center" style="margin-bottom: 24px;">
                    <a-space size="middle">
                        <a-button @click="navigateTo('/admin/articles')">
                            <template #icon><ArrowLeftOutlined /></template>
                        </a-button>
                        <a-typography-title :level="2" style="margin: 0;">
                            แก้ไขบทความ
                        </a-typography-title>
                    </a-space>
                    <a-tag color="blue">รหัสบทความ: {{ articleId }}</a-tag>
                </a-flex>

                <a-skeleton :loading="fetching" active :paragraph="{ rows: 12 }">
                    <a-form layout="vertical">
                        
                        <a-card title="เนื้อหาบทความ" style="margin-bottom: 24px; border-radius: 8px;">
                            <a-form-item label="หัวข้อบทความ" required>
                                <a-input 
                                    v-model:value="formState.title" 
                                    placeholder="ใส่หัวข้อที่นี่..." 
                                    size="large" 
                                />
                            </a-form-item>
                            
                            <a-form-item label="รายละเอียดเนื้อหา" required>
                                <TiptapEditor v-model="formState.content" />
                            </a-form-item>
                        </a-card>

                        <a-card title="รูปภาพประกอบ (สูงสุด 3 รูป)" style="margin-bottom: 24px; border-radius: 8px;">
                            <a-upload
                                v-model:file-list="fileList"
                                list-type="picture-card"
                                :before-upload="() => false"
                            >
                                <div v-if="fileList.length < 3">
                                    <PlusOutlined />
                                    <div style="margin-top: 8px">เพิ่มรูปภาพ</div>
                                </div>
                            </a-upload>
                            <a-typography-text type="secondary">
                                * รองรับไฟล์รูปภาพประกอบเนื้อหา (สูงสุด 3 รูป)
                            </a-typography-text>
                        </a-card>

                        <a-card title="ตั้งค่าการเผยแพร่และ SEO" style="margin-bottom: 32px; border-radius: 8px;">
                            <a-row :gutter="32">
                                <a-col :md="16" :xs="24">
                                    <a-form-item label="หัวข้อสำหรับ SEO (Meta Title)">
                                        <a-input v-model:value="formState.meta_title" placeholder="ถ้าว่างไว้จะใช้หัวข้อบทความแทน" />
                                    </a-form-item>
                                    <a-form-item label="คำอธิบายสำหรับ SEO (Meta Description)">
                                        <a-textarea v-model:value="formState.meta_description" :rows="4" />
                                    </a-form-item>
                                </a-col>
                                <a-col :md="8" :xs="24">
                                    <a-form-item label="สถานะบทความ">
                                        <a-select v-model:value="formState.status" size="large" style="width: 100%">
                                            <a-select-option value="draft">แบบร่าง (Draft)</a-select-option>
                                            <a-select-option value="published">เผยแพร่ (Published)</a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                        </a-card>

                        <a-card style="border-radius: 8px; background-color: #fafafa;">
                            <a-flex justify="center" gap="middle">
                                <a-button size="large" @click="navigateTo('/admin/articles')">
                                    <template #icon><CloseOutlined /></template>ยกเลิก
                                </a-button>
                                <a-button 
                                    type="primary" 
                                    size="large" 
                                    :loading="loading" 
                                    @click="handleUpdate"
                                >
                                    <template #icon><SaveOutlined /></template>บันทึกการแก้ไข
                                </a-button>
                            </a-flex>
                        </a-card>

                    </a-form>
                </a-skeleton>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
/* ใช้ CSS Scoped เล็กน้อยสำหรับตกแต่งส่วนที่ Ant Design ไม่มีให้ */
.ant-card {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}
</style>