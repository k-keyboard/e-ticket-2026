import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = body

    if (!token || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Missing token or password' })
    }

    // 1. ค้นหา Email จาก Token
    const [tokens]: any = await db.query(
      'SELECT email FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    )

    if (!tokens || tokens.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
    }

    const email = tokens[0].email
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2. อัปเดตข้อมูล (ใช้ชื่อ password_hash ตามรูป DB ของคุณ)
    const [result]: any = await db.query(
      'UPDATE users SET password_hash = ?, status = "active" WHERE email = ?',
      [hashedPassword, email]
    )

    // 3. ลบ Token ทิ้ง
    await db.query('DELETE FROM verification_tokens WHERE token = ?', [token])

    return { status: 'success', message: 'Password setup completed' }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})