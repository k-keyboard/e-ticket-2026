import bcrypt from 'bcryptjs' // เปลี่ยนเป็น bcryptjs เพื่อลดปัญหาบน Linux Server

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = body

    if (!token || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Missing token or password' })
    }

    // 1. ค้นหา Email จาก Token (เช็คการเชื่อมต่อ DB)
    const [tokens]: any = await db.query(
      'SELECT email FROM verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    ).catch(err => {
        console.error('DB Query Error (Tokens):', err)
        throw createError({ statusCode: 500, statusMessage: 'Database connection failed' })
    })

    if (!tokens || tokens.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' })
    }

    const email = tokens[0].email
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2. อัปเดตข้อมูล 
    // ตรวจสอบชื่อ TABLE และ COLUMN ให้ตรงกับรูปโครงสร้าง DB ของคุณ
    await db.query(
      'UPDATE users SET password_hash = ?, status = "active" WHERE email = ?',
      [hashedPassword, email]
    ).catch(err => {
        console.error('DB Update Error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update user password' })
    })

    // 3. ลบ Token ทิ้ง
    await db.query('DELETE FROM verification_tokens WHERE token = ?', [token])

    return { status: 'success', message: 'Password setup completed' }

  } catch (error: any) {
    // พ่น Error ออกมาที่หน้าจอ Terminal ของ Server (PM2 Log) เพื่อดูสาเหตุที่แท้จริง
    console.error('Setup Password Full Error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Server Error',
      message: error.message // ส่งข้อความ error ออกไปดูเพื่อ debug (ควรปิดเมื่อใช้งานจริง)
    })
  }
})