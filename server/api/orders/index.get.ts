export default defineEventHandler(async (event) => {
  try {
      const [rows] = await db.query(`
          SELECT 
              o.id,
              o.customer_name,
              o.customer_email,
              o.total_amount,
              o.payment_status,
              o.created_at,
              ot.ticket_code,
              ot.is_used,
              t.name as ticket_type
          FROM orders o
          JOIN order_tickets ot ON o.id = ot.order_id
          JOIN tickets t ON ot.ticket_id = t.id
          ORDER BY o.created_at DESC
      `)
      
      return { 
          success: true, 
          data: rows 
      }
  } catch (error: any) {
      throw createError({ 
          statusCode: 500, 
          message: `Database Error: ${error.message}` 
      })
  }
})