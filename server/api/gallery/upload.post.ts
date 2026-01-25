import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
    // 1. อ่านข้อมูลที่ส่งมาจากฟอร์ม
    const formData = await readMultipartFormData(event)
    if (!formData) {
        throw createError({ statusCode: 400, message: 'No file uploaded' })
    }

    // 2. กำหนด Path โฟลเดอร์ภายนอก ( ../ คือถอยออกจากโปรเจกต์ 1 ระดับ)
    const uploadDir = path.resolve(process.cwd(), '../uploads_data/gallery')

    // สร้าง Folder ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uploadedFiles = []

    // 3. วนลูปจัดการไฟล์ (ใช้ for...of ปกติเพื่อความเรียบง่ายและเสถียร)
    for (const file of formData) {
        // ตรวจสอบว่าเป็นฟิลด์ที่ชื่อ 'images' และมีข้อมูลไฟล์จริง
        if (file.name === 'images' && file.filename && file.data) {

            // สุ่มชื่อไฟล์ใหม่ (hex 16 bytes + นามสกุลเดิม)
            const ext = path.extname(file.filename).toLowerCase()
            const newFileName = `${crypto.randomBytes(16).toString('hex')}${ext}`
            const filePath = path.join(uploadDir, newFileName)

            try {
                // เขียนไฟล์ลงในโฟลเดอร์ภายนอก
                fs.writeFileSync(filePath, file.data)

                // บันทึกข้อมูลลงฐานข้อมูล
                await db.query(
                    'INSERT INTO gallery (image_name, original_name) VALUES (?, ?)',
                    [newFileName, file.filename]
                )

                uploadedFiles.push({
                    originalName: file.filename,
                    newName: newFileName
                })
            } catch (err: any) {
                console.error(`Failed to upload ${file.filename}:`, err)
                // สามารถเพิ่ม Logic ลบไฟล์ที่ค้างอยู่ถ้า Database บันทึกไม่สำเร็จได้ที่นี่
            }
        }
    }

    // 4. ส่งผลลัพธ์กลับ
    return {
        success: true,
        message: `${uploadedFiles.length} images uploaded successfully`,
        data: uploadedFiles
    }
})