import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const stripe = await useServerStripe(event)

    try {
        const stripeProducts = await stripe.products.list({
            expand: ['data.default_price'],
            active: true,
            limit: 100
        })

        const stripeIds = stripeProducts.data.map(p => p.id)

        if (stripeIds.length > 0) {
            for (const product of stripeProducts.data) {
                const price: any = product.default_price
                // ดึงรูปภาพแรกจากรายการ images ของ Stripe
                const imageUrl = product.images.length > 0 ? product.images[0] : null

                await db.query(`
                    INSERT INTO tickets (
                        stripe_product_id, stripe_price_id, name, description, 
                        image, price, currency, is_active, deleted_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NULL)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        description = VALUES(description),
                        image = VALUES(image),
                        price = VALUES(price),
                        stripe_price_id = VALUES(stripe_price_id),
                        is_active = 'active',
                        deleted_at = NULL
                `, [
                    product.id,
                    price?.id,
                    product.name,
                    product.description,
                    imageUrl, // บันทึกรูปภาพ
                    (price?.unit_amount / 100) || 0,
                    price?.currency || 'thb'
                ])
            }

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