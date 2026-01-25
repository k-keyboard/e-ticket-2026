import { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
    // ดึง query parameters จาก URL เช่น ?status=published&limit=4
    const query = getQuery(event)
    const status = query.status as string
    const limit = parseInt(query.limit as string) || 20 // ค่าเริ่มต้น 20 รายการ

    try {
        let sql = `
      SELECT 
        a.id, 
        a.title, 
        a.meta_description,
        a.status, 
        a.created_at,
        (SELECT image_url FROM article_images WHERE article_id = a.id LIMIT 1) as main_image
      FROM articles a
    `
        const params: any[] = []

        // ถ้ามีการระบุ status (สำหรับหน้าบ้าน) ให้เพิ่ม WHERE clause
        if (status) {
            sql += ` WHERE a.status = ?`
            params.push(status)
        }

        sql += ` ORDER BY a.created_at DESC LIMIT ?`
        params.push(limit)

        const [rows] = await db.query<RowDataPacket[]>(sql, params)

        return rows.map(row => ({
            id: row.id,
            title: row.title,
            meta_description: row.meta_description,
            status: row.status,
            created_at: row.created_at,
            images: row.main_image ? [{ image_url: row.main_image }] : []
        }))

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Database Error: ' + error.message
        })
    }
})