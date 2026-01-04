import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password } = body

  try {
    // 1. ตรวจสอบความถูกต้องของ Token อีกครั้งก่อนบันทึก
    const [tokenData]: any = await db.query(
      'SELECT email FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    )

    if (tokenData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'เซสชันหมดอายุ กรุณาขอลิงก์ใหม่' })
    }

    const email = tokenData[0].email

    // 2. แฮชรหัสผ่าน (ใช้ bcrypt เพื่อความปลอดภัย)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. อัปเดตข้อมูลผู้ใช้
    await db.query(
      'UPDATE users SET password_hash = ?, status = "active" WHERE email = ?',
      [hashedPassword, email]
    )

    // 4. ลบ Token ที่ใช้งานแล้วทิ้ง
    await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])

    return { success: true, message: 'ตั้งรหัสผ่านสำเร็จแล้ว' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' })
  }
})