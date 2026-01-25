<script setup>
import { 
  SaveOutlined, 
  CloseOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'admin' })

const formState = reactive({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
})

const fileList = ref([])
const loading = ref(false)

const handleSave = async () => {
    if (!formState.title || !formState.content) {
        return message.error('กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน')
    }

    loading.value = true
    const body = new FormData()
    
    // รวมข้อมูล Text fields
    Object.keys(formState).forEach((key) => body.append(key, formState[key]))
    
    // รวมไฟล์รูปภาพ (จำกัด 3 รูปตามเงื่อนไขที่กำหนด)
    fileList.value.forEach((file) => {
        if (file.originFileObj) body.append('images', file.originFileObj)
    })

    try {
        await $fetch('/api/articles', { method: 'POST', body })
        message.success('บันทึกบทความใหม่เรียบร้อยแล้ว')
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
                            เขียนบทความใหม่
                        </a-typography-title>
                    </a-space>
                </a-flex>

                <ClientOnly>
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
                                * รองรับไฟล์รูปภาพประกอบ (จำกัดสูงสุด 3 รูปตามที่กำหนดไว้)
                            </a-typography-text>
                        </a-card>

                        <a-card title="ตั้งค่าการเผยแพร่และ SEO" style="margin-bottom: 32px; border-radius: 8px;">
                            <a-row :gutter="32">
                                <a-col :md="16" :xs="24">
                                    <a-form-item label="หัวข้อสำหรับ SEO (Meta Title)">
                                        <a-input v-model:value="formState.meta_title" placeholder="หากเว้นว่างจะใช้หัวข้อบทความแทน" />
                                    </a-form-item>
                                    <a-form-item label="คำอธิบายสำหรับ SEO (Meta Description)">
                                        <a-textarea v-model:value="formState.meta_description" :rows="4" placeholder="สรุปเนื้อหาบทความสั้นๆ..." />
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

                        <a-card :bordered="false" style="border-radius: 8px; background-color: #fafafa; border: 1px solid #f0f0f0;">
                            <a-flex justify="center" gap="middle">
                                <a-button size="large" @click="navigateTo('/admin/articles')">
                                    <template #icon><CloseOutlined /></template>ยกเลิก
                                </a-button>
                                <a-button 
                                    type="primary" 
                                    size="large" 
                                    :loading="loading" 
                                    @click="handleSave"
                                >
                                    <template #icon><SaveOutlined /></template>บันทึกบทความ
                                </a-button>
                            </a-flex>
                        </a-card>

                    </a-form>

                    <template #fallback>
                        <a-card style="border-radius: 8px; padding: 24px;">
                            <a-skeleton active :paragraph="{ rows: 15 }" />
                        </a-card>
                    </template>
                </ClientOnly>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
/* เพิ่มเงาเล็กน้อยให้ Card ดูมีมิติแบบ Ant Design */
.ant-card {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}
</style>