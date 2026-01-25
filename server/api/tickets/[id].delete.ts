export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  try {
      await db.query(
          "UPDATE tickets SET deleted_at = NOW(), is_active = 'suspended' WHERE id = ?",
          [id]
      )
      return { success: true }
  } catch (error: any) {
      throw createError({ statusCode: 500, message: error.message })
  }
})