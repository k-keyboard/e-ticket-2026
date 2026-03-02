export default defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM tickets
      WHERE deleted_at IS NULL
      ORDER BY id DESC
    `)

    return rows
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Database connection error',
    })
  }
})
