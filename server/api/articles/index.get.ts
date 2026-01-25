export default defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(
      'SELECT id, title, slug, status, created_at FROM articles ORDER BY created_at DESC'
    )
    return rows
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})