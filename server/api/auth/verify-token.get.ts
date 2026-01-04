export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token

  if (!token) throw createError({ statusCode: 400, statusMessage: 'ไม่พบ Token' })

  // ค้นหา Token ที่ยังไม่หมดอายุ
  const [rows]: any = await db.query(
    'SELECT email FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  )

  if (rows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' })
  }

  return { email: rows[0].email }
})