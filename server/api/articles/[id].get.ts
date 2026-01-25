import { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  try {
    // 1. ดึงข้อมูลบทความ
    const [articles] = await db.query<RowDataPacket[]>(
      'SELECT id, title, content, meta_title, meta_description, status FROM articles WHERE id = ?',
      [id]
    )

    if (articles.length === 0) {
      throw createError({ statusCode: 404, message: 'ไม่พบบทความ' })
    }

    const article = articles[0]

    // 2. ดึงรูปภาพ และตรวจสอบให้แน่ใจว่า path ถูกต้อง
    const [images] = await db.query<RowDataPacket[]>(
      'SELECT id, image_url FROM article_images WHERE article_id = ?',
      [id]
    )

    // ส่งค่ากลับไปในรูปแบบที่พร้อมให้ Edit.vue ใช้งาน
    return {
      success: true,
      data: {
        ...article,
        // มั่นใจว่าภาพถูกส่งกลับเป็น Array
        images: images.map(img => ({
          id: img.id,
          url: img.image_url // ค่าจาก DB คือ /uploads/articles/xxx.png
        }))
      }
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})