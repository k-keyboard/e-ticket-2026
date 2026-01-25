import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    // 1. รับ ID จาก URL Parameter
    const id = getRouterParam(event, 'id')

    try {
        // 2. ดึงข้อมูลชื่อไฟล์จาก Database มาเก็บไว้ก่อนลบ
        const [rows]: any = await db.query(
            'SELECT image_name FROM gallery WHERE id = ?',
            [id]
        )

        if (rows.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Image not found in database'
            })
        }

        const fileName = rows[0].image_name
        // กำหนด Path ไปยังโฟลเดอร์ภายนอก (ต้องตรงกับตอนอัพโหลด)
        const uploadDir = path.resolve(process.cwd(), '../uploads_data/gallery')
        const filePath = path.join(uploadDir, fileName)

        // 3. ลบข้อมูลใน Database
        await db.query('DELETE FROM gallery WHERE id = ?', [id])

        // 4. ตรวจสอบและลบไฟล์จริงออกจาก Disk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath) // ลบไฟล์
        }

        return {
            success: true,
            message: 'Image deleted successfully'
        }

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to delete image'
        })
    }
})