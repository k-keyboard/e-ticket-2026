export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { event_time, title, description, sort_order } = body

  try {
    const [result]: any = await db.query(
      'INSERT INTO events (event_time, title, description, sort_order) VALUES (?, ?, ?, ?)',
      [event_time, title, description, sort_order || 0]
    )
    return { id: result.insertId, message: 'Event created successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})