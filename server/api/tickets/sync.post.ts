import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const stripe = await useServerStripe(event)
    
    try {
        const stripeProducts = await stripe.products.list({
            expand: ['data.default_price'],
            active: true
        })

        for (const product of stripeProducts.data) {
            const price: any = product.default_price
            await db.query(`
                INSERT INTO tickets (stripe_product_id, stripe_price_id, name, description, price, currency)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    description = VALUES(description),
                    price = VALUES(price)
            `, [
                product.id, 
                price?.id, 
                product.name, 
                product.description, 
                (price?.unit_amount / 100) || 0, 
                price?.currency || 'thb'
            ])
        }
        return { message: 'Sync completed' }
    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message })
    }
})