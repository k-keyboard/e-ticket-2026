import { useServerStripe } from '#stripe/server'
import { sendTicketEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event)
  const headers = getHeaders(event)
  const body = await readRawBody(event)
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let stripeEvent;

  try {
    const sig = headers['stripe-signature']
    stripeEvent = stripe.webhooks.constructEvent(body!, sig!, endpointSecret!)
  } catch (err: any) {
    throw createError({ statusCode: 400, message: `Webhook Error: ${err.message}` })
  }

  // ตัวอย่าง Logic ภายใน Webhook
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // 1. บันทึกลงตาราง orders
    const [result] = await db.query(
      'INSERT INTO orders (stripe_session_id, customer_name, customer_email, total_amount, payment_status) VALUES (?, ?, ?, ?, ?)',
      [session.id, session.customer_details.name, session.customer_details.email, session.amount_total / 100, 'paid']
    );
    const newOrderId = (result as any).insertId;

    // 2. สร้าง Ticket Code และบันทึกลง order_tickets
    const ticketCode = `YP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await db.query(
      'INSERT INTO order_tickets (order_id, ticket_id, ticket_code) VALUES (?, ?, ?)',
      [newOrderId, 1, ticketCode] // สมมติ ticket_id = 1
    );

    // 3. ส่ง Email
    await sendTicketEmail(session.customer_details.email, {
      customerName: session.customer_details.name,
      orderId: ticketCode, // ใช้รหัสตั๋วที่เราเจนเอง
    });
  }
  return { received: true }
})