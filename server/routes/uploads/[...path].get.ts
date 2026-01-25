import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  // ดึง path ต่อจาก /uploads/... มา
  const relPath = event.context.params?.path // เช่น articles/filename.png
  
  // ชี้ไปยังโฟลเดอร์ภายนอกที่คุณกำหนดไว้
  const absolutePath = path.resolve(process.cwd(), '../uploads_data', relPath || '')

  if (fs.existsSync(absolutePath)) {
    // ส่ง Stream ของไฟล์ภาพกลับไปให้ Browser
    return sendStream(event, fs.createReadStream(absolutePath))
  }
  
  throw createError({ statusCode: 404, message: 'Image not found' })
})