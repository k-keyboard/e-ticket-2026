export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event) // { stock_quantity, is_active }

  try {
    await db.query(
      'UPDATE tickets SET stock_quantity = ?, is_active = ? WHERE id = ?',
      [body.stock_quantity, body.is_active, id]
    )
    return { message: 'Updated successfully' }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})