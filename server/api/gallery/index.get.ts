export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 8

    try {
        const [rows]: any = await db.query(
            'SELECT id, image_name FROM gallery ORDER BY id DESC LIMIT ?',
            [limit]
        )

        // ส่ง URL ที่ Client จะเอาไปเรียกใช้งาน
        // (โดยเราจะตั้งค่า Symlink หรือ Route พิเศษให้เข้าถึง uploads_data ได้)
        return rows.map((row: any) => ({
            id: row.id,
            url: `/api/gallery/view/${row.image_name}` // ใช้ API ในการดึงรูปมาโชว์
        }))
    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message })
    }
})