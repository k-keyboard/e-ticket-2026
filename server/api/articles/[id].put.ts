import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { ResultSetHeader } from 'mysql2'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // 1. อ่านข้อมูลแบบ Multipart
  const formData = await readMultipartFormData(event)
  if (!formData) throw createError({ statusCode: 400, message: 'No data provided' })

  // ที่เก็บไฟล์ตามที่คุณกำหนด (ออกไปนอก project folder 1 ชั้น)
  const uploadDir = path.resolve(process.cwd(), '../uploads_data/articles')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const data: any = {}
  const uploadedFiles: string[] = []

  // 2. วนลูปแยกข้อมูล Text และ Files
  for (const item of formData) {
    if (item.name && item.filename && item.data) {
      // จัดการไฟล์รูปภาพ
      const ext = path.extname(item.filename).toLowerCase()
      const newFileName = `${crypto.randomBytes(16).toString('hex')}${ext}`
      const filePath = path.join(uploadDir, newFileName)

      fs.writeFileSync(filePath, item.data)
      // path ที่จะเก็บลง DB (เพื่อให้หน้าเว็บเรียกใช้ได้ผ่าน /uploads/articles/...)
      uploadedFiles.push(`/uploads/articles/${newFileName}`)
    } else if (item.name) {
      data[item.name] = item.data.toString()
    }
  }

  const { title, content, meta_title, meta_description, status } = data
  // สร้าง Slug ใหม่ตาม Title ที่อาจจะถูกแก้ไข
  const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

  try {
    // 3. อัปเดตข้อมูลบทความ (UPDATE แทน INSERT)
    await db.query(
      'UPDATE articles SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, status = ? WHERE id = ?',
      [title, slug, content, meta_title, meta_description, status, id]
    )

    // 4. บันทึกรูปภาพใหม่เพิ่มเข้าไป (ถ้ามี)
    if (uploadedFiles.length > 0) {
      for (const url of uploadedFiles) {
        await db.query(
          'INSERT INTO article_images (article_id, image_url) VALUES (?, ?)',
          [id, url]
        )
      }
    }

    return { success: true, message: 'Updated successfully' }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})