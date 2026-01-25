export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { status } = await readBody(event) // รับค่า 'active' หรือ 'suspended'

  try {
      await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
      return { message: 'Status updated' }
  } catch (error: any) {
      throw createError({ statusCode: 500, message: error.message })
  }
})