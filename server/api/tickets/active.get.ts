export default defineEventHandler(async (event) => {
  try {
    setResponseHeaders(event, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })

    const [rows]: any = await db.query(`
      SELECT 
        id,
        name,
        stripe_price_id AS priceId,
        image,
        price,
        currency,
        stock_quantity
      FROM tickets
      WHERE is_active = 'active'
      AND deleted_at IS NULL
      ORDER BY stock_quantity DESC, id DESC
      LIMIT 1
    `)

    return rows?.[0] || null

  } catch (error: any) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
