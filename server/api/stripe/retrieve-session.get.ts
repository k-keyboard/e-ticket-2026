import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const { session_id } = getQuery(event)
    if (!session_id) throw createError({ statusCode: 400, message: 'Missing session_id' })

    const stripe = await useServerStripe(event)

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id as string, {
            expand: ['line_items', 'customer']
        })

        if (session.payment_status !== 'paid') {
            throw createError({ statusCode: 402, message: 'Payment not completed' })
        }

        // 1. ตรวจสอบ Idempotency
        const [existingOrder]: any = await db.query(
            "SELECT id FROM orders WHERE stripe_session_id = ?",
            [session.id]
        )

        let orderId: number

        if (existingOrder.length === 0) {
            // 2. บันทึกลงตาราง orders (อ้างอิงตามภาพ Screenshot ของคุณ)
            const [orderResult]: any = await db.query(`
                INSERT INTO orders (
                    stripe_session_id, customer_name, customer_email, 
                    total_amount, status, payment_status, currency, created_at
                ) VALUES (?, ?, ?, ?, 'paid', 'paid', ?, NOW())
            `, [
                session.id,
                session.customer_details?.name || 'Customer',
                session.customer_details?.email,
                (session.amount_total || 0) / 100,
                session.currency?.toUpperCase() || 'THB'
            ])

            orderId = orderResult.insertId

            // 3. จัดการรายการตั๋วใน order_tickets
            const lineItems = session.line_items?.data || []
            for (const item of lineItems) {
                // ค้นหา ticket_id จากตาราง tickets โดยใช้ชื่อสินค้าที่ตรงกัน
                const [ticketData]: any = await db.query(
                    "SELECT id FROM tickets WHERE name = ? LIMIT 1",
                    [item.description]
                )
                
                const ticketId = ticketData[0]?.id || null

                // วนลูปตามจำนวน quantity เพื่อสร้าง Ticket Code แยกใบ
                for (let i = 0; i < (item.quantity || 1); i++) {
                    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase()
                    const ticketCode = `LN-${orderId}-${randomCode}`

                    await db.query(`
                        INSERT INTO order_tickets (order_id, ticket_id, ticket_code, is_used) 
                        VALUES (?, ?, ?, 0)
                    `, [orderId, ticketId, ticketCode])
                }

                // 4. ลดสต็อกตั๋วในตาราง tickets
                if (ticketId) {
                    await db.query(`
                        UPDATE tickets 
                        SET stock_quantity = GREATEST(0, stock_quantity - ?) 
                        WHERE id = ?
                    `, [item.quantity, ticketId])
                }
            }

            // 5. ส่งอีเมลยืนยัน (เรียกใช้ helper เดิม)
            await sendConfirmationEmail({
                email: session.customer_details?.email as string,
                orderId: orderId,
                customerName: session.customer_details?.name || 'Customer',
                items: lineItems
            })

        } else {
            orderId = existingOrder[0].id
        }

        return {
            success: true,
            order_id: orderId,
            customer_name: session.customer_details?.name,
            total: (session.amount_total || 0) / 100
        }

    } catch (error: any) {
        console.error('Retrieve Session Error:', error.message)
        throw createError({ statusCode: 500, message: error.message })
    }
})