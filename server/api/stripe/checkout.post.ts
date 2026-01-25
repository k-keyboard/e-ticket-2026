import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
    const stripe = await useServerStripe(event)
    const body = await readBody(event)
    const config = useRuntimeConfig()

    const siteUrl = config.public.siteUrl

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: body.email, 
            line_items: [
                {
                    price: body.priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/#ticket`,
        })

        return { url: session.url }
    } catch (error: any) {
        throw createError({ 
            statusCode: 500, 
            message: `Stripe Error: ${error.message}` 
        })
    }
})