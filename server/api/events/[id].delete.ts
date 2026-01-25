export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  try {
    await db.query('DELETE FROM events WHERE id = ?', [id])
    return { message: 'Event deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})