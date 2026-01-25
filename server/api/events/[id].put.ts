export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { event_time, title, description, sort_order } = body

  try {
    await db.query(
      'UPDATE events SET event_time = ?, title = ?, description = ?, sort_order = ? WHERE id = ?',
      [event_time, title, description, sort_order, id]
    )
    return { message: 'Event updated successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})