// server/api/stripe/products.get.ts
import { useServerStripe } from '#stripe/server' // เปลี่ยนเป็น useServerStripe

export default defineEventHandler(async (event) => {
    // เรียกใช้งานผ่านตัวแปรที่เปลี่ยนชื่อใหม่
    const stripe = await useServerStripe(event)

    try {
        const products = await stripe.products.list({
            expand: ['data.default_price'],
            active: true
        })
        return products.data
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch products from Stripe',
        })
    }
})