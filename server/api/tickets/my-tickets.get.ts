export default defineEventHandler(async (event) => {
  const { email } = getQuery(event)
  
  if (!email) {
      return []
  }

  try {
      // 1. ดึงข้อมูล Orders ที่ชำระเงินแล้วของ Email นี้
      // ใช้ ORDER BY เพื่อให้ออเดอร์ล่าสุดอยู่ด้านบน
      const [orders]: any = await db.query(`
          SELECT id, total_amount, status, created_at 
          FROM orders 
          WHERE customer_email = ? AND (status = 'paid' OR payment_status = 'paid')
          ORDER BY created_at DESC
      `, [email])

      // 2. วนลูปเพื่อดึงรายการตั๋วในแต่ละออเดอร์
      for (const order of orders) {
          const [tickets]: any = await db.query(`
              SELECT 
                  ot.ticket_code, 
                  ot.is_used, 
                  t.name as ticket_name,
                  t.description as ticket_description
              FROM order_tickets ot
              LEFT JOIN tickets t ON ot.ticket_id = t.id
              WHERE ot.order_id = ?
          `, [order.id])
          
          order.tickets = tickets
      }

      return orders

  } catch (error: any) {
      throw createError({
          statusCode: 500,
          statusMessage: 'ไม่สามารถดึงข้อมูลตั๋วได้: ' + error.message
      })
  }
})