export default defineEventHandler(async (event) => {
  const { orderId } = await readBody(event)

  if (!orderId) {
      throw createError({ statusCode: 400, message: 'Missing Order ID' })
  }

  try {
      // ดึงข้อมูลคำสั่งซื้อพร้อมรหัสตั๋วจาก Database
      const [rows] = await db.query(`
          SELECT o.customer_name, o.customer_email, ot.ticket_code 
          FROM orders o
          JOIN order_tickets ot ON o.id = ot.order_id
          WHERE o.id = ?
      `, [orderId])

      const order = (rows as any)[0]

      if (!order) {
          throw createError({ statusCode: 404, message: 'Order not found' })
      }

      // เรียกใช้ Mailer Utility ที่เราสร้างไว้ (Celestial Lanna Template)
      await sendTicketEmail(order.customer_email, {
          customerName: order.customer_name,
          orderId: order.ticket_code
      })

      return { 
          success: true, 
          message: 'Email has been resent' 
      }
  } catch (error: any) {
      throw createError({ 
          statusCode: 500, 
          message: `Mailer Error: ${error.message}` 
      })
  }
})