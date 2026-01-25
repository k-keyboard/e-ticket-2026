import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { ResultSetHeader } from 'mysql2'

export default defineEventHandler(async (event) => {
  // 1. อ่านข้อมูลแบบ Multipart (รวมทั้งไฟล์และ text fields)
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, message: 'No data provided' })

  const uploadDir = path.resolve(process.cwd(), '../uploads_data/articles')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  // ตัวแปรสำหรับเก็บข้อมูลจากฟอร์ม
  const data: any = {}
  const uploadedFiles: string[] = []

  // 2. แยกข้อมูล: วนลูป formData เพื่อแยก Text fields และ Files
  for (const item of formData) {
    if (item.name && item.filename && item.data) {
      // นี่คือไฟล์รูปภาพ
      const ext = path.extname(item.filename).toLowerCase()
      const newFileName = `${crypto.randomBytes(16).toString('hex')}${ext}`
      const filePath = path.join(uploadDir, newFileName)

      fs.writeFileSync(filePath, item.data)
      uploadedFiles.push(`/uploads/articles/${newFileName}`)
    } else if (item.name) {
      // นี่คือ Text field (title, content, status, etc.)
      data[item.name] = item.data.toString()
    }
  }

  // 3. เตรียมข้อมูลสำหรับบันทึก
  const { title, content, meta_title, meta_description, status } = data
  const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

  try {
    // 4. บันทึกบทความลงฐานข้อมูล
    const [res] = await db.query<ResultSetHeader>(
      'INSERT INTO articles (title, slug, content, meta_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, content, meta_title, meta_description, status]
    )
    const articleId = res.insertId

    // 5. บันทึกชื่อรูปภาพลงตาราง article_images (ถ้ามี)
    if (uploadedFiles.length > 0) {
      for (const url of uploadedFiles) {
        await db.query(
          'INSERT INTO article_images (article_id, image_url) VALUES (?, ?)',
          [articleId, url]
        )
      }
    }

    return { success: true, id: articleId }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})