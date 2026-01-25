import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const stripe = await useServerStripe(event)

    try {
        // 1. ดึงรายการสินค้าจาก Stripe (เฉพาะที่ active)
        const stripeProducts = await stripe.products.list({
            expand: ['data.default_price'],
            active: true,
            limit: 100
        })

        const stripeIds = stripeProducts.data.map(p => p.id)

        if (stripeIds.length > 0) {
            // 2. Upsert ข้อมูล: ถ้าเจอ ID เดิมให้ Update และเคลียร์ค่า deleted_at เป็น NULL
            for (const product of stripeProducts.data) {
                const price: any = product.default_price
                await db.query(`
                    INSERT INTO tickets (
                        stripe_product_id, stripe_price_id, name, description, 
                        price, currency, is_active, deleted_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, 'active', NULL)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        description = VALUES(description),
                        price = VALUES(price),
                        stripe_price_id = VALUES(stripe_price_id),
                        is_active = 'active',
                        deleted_at = NULL
                `, [
                    product.id,
                    price?.id,
                    product.name,
                    product.description,
                    (price?.unit_amount / 100) || 0,
                    price?.currency || 'thb'
                ])
            }

            // 3. Soft Delete: ถ้าใน Stripe ไม่มีแล้ว ให้ตั้งค่า deleted_at และ suspended
            await db.query(`
                UPDATE tickets 
                SET is_active = 'suspended', deleted_at = NOW() 
                WHERE stripe_product_id NOT IN (?) AND deleted_at IS NULL
            `, [stripeIds])
        }

        return { success: true, count: stripeIds.length }

    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message })
    }
})