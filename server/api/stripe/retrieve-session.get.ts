import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const { session_id } = getQuery(event)
    if (!session_id) throw createError({ statusCode: 400, message: 'Missing session_id' })

    const stripe = await useServerStripe(event)

    try {
        // ดึงข้อมูล Session จาก Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id as string, {
            expand: ['line_items', 'customer']
        })

        if (session.payment_status !== 'paid') {
            throw createError({ statusCode: 402, message: 'Payment not completed' })
        }

        // 1. เช็ค Idempotency (ป้องกันการรันซ้ำ)
        const [existingOrder]: any = await db.query(
            "SELECT id FROM orders WHERE stripe_session_id = ?",
            [session.id]
        )

        let orderId: number

        if (existingOrder.length === 0) {
            console.log('--- Processing New Order ---')
            
            // 2. บันทึก Order ใหม่
            const [orderResult]: any = await db.query(`
                INSERT INTO orders (
                    stripe_session_id, customer_name, customer_email, 
                    total_amount, status, payment_status, currency, created_at
                ) VALUES (?, ?, ?, ?, 'paid', 'paid', ?, NOW())
            `, [
                session.id,
                session.customer_details?.name || 'Guest',
                session.customer_details?.email,
                (session.amount_total || 0) / 100,
                session.currency?.toUpperCase() || 'THB'
            ])

            orderId = orderResult.insertId

            // 3. สร้างตั๋วและลดสต็อก
            const lineItems = session.line_items?.data || []
            for (const item of lineItems) {
                const [ticketData]: any = await db.query(
                    "SELECT id FROM tickets WHERE name = ? LIMIT 1",
                    [item.description]
                )
                const ticketId = ticketData[0]?.id || null

                // สร้าง Ticket Code
                for (let i = 0; i < (item.quantity || 1); i++) {
                    const ticketCode = `YP26-${orderId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                    await db.query(`
                        INSERT INTO order_tickets (order_id, ticket_id, ticket_code, is_used) 
                        VALUES (?, ?, ?, 0)
                    `, [orderId, ticketId, ticketCode])
                }

                // ลด Stock
                if (ticketId) {
                    await db.query("UPDATE tickets SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?", [item.quantity, ticketId])
                }
            }

            // 4. ส่งอีเมลยืนยัน (เรียกเพียงครั้งเดียว)
            try {
                console.log('Attempting to send email to:', session.customer_details?.email)
                
                await sendConfirmationEmail({
                    email: session.customer_details?.email as string,
                    orderId: orderId,
                    customerName: session.customer_details?.name || 'Customer',
                    items: lineItems
                })

                console.log('✅ Email sent successfully!')
            } catch (mailError: any) {
                // เก็บ Log กรณีเมลไม่ไป แต่ไม่ให้ Error หน้าเว็บ (ลูกค้าจะได้เห็นหน้า Success)
                console.error('❌ Mail Transport Error:', mailError.message)
            }

        } else {
            console.log('ℹ️ Order already exists. Skipping database and email logic.')
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