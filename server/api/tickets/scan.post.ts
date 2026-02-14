export default defineEventHandler(async (event) => {
    const { ticket_code, action } = await readBody(event)

    try {
        // 1. ค้นหาข้อมูลตั๋ว (ตัด Join ตาราง Events ออกชั่วคราวเพื่อเช็คว่า Error หายไหม)
        const [rows]: any = await db.query(`
            SELECT 
                ot.id, ot.ticket_code, ot.is_used, ot.scanned_at,
                o.customer_name, o.customer_email, o.payment_status,
                t.name as ticket_name
            FROM order_tickets ot
            JOIN orders o ON ot.order_id = o.id
            JOIN tickets t ON ot.ticket_id = t.id
            WHERE ot.ticket_code = ?
        `, [ticket_code])

        if (rows.length === 0) {
            throw createError({ statusCode: 404, message: 'ไม่พบข้อมูลตั๋วใบนี้ในระบบ' })
        }

        const ticket = rows[0]

        // 2. ถ้าเป็นการกด "ยืนยันใช้งาน"
        if (action === 'confirm') {
            if (ticket.is_used === 1) {
                throw createError({ statusCode: 400, message: 'ตั๋วนี้ถูกใช้งานไปแล้ว' })
            }
            // ปรับตรงนี้ให้ยืดหยุ่น ถ้ายังไม่จ่ายเงินแต่แอดมินจะให้เข้า (หรือจะล็อคไว้แบบเดิมก็ได้)
            if (ticket.payment_status !== 'paid') {
                throw createError({ statusCode: 400, message: 'ออเดอร์นี้ยังไม่ได้ชำระเงิน' })
            }

            // บันทึกเวลาปัจจุบันลงในคอลัมน์ scanned_at ที่คุณเพิ่งสร้าง
            await db.query(`
                UPDATE order_tickets 
                SET is_used = 1, scanned_at = NOW() 
                WHERE id = ?
            `, [ticket.id])

            return { success: true, message: 'เช็คอินสำเร็จ' }
        }

        // 3. ดูข้อมูล (ส่งกลับไปโชว์ที่ Modal)
        return { success: true, ticket }

    } catch (error: any) {
        // พ่น Error จริงออกมาที่ Terminal เพื่อให้เราแก้ได้ถูกจุด
        console.error("Database Query Error:", error.message)

        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal Server Error'
        })
    }
})