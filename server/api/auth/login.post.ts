import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // 1. ตั้งค่า CORS เพื่อให้ Localhost คุยกับ Server ได้
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
  })

  if (isPreflightRequest(event)) {
    return null
  }

  const body = await readBody(event)
  const { email, password } = body

  try {
    // 2. ตรวจสอบ User โดยใช้คอลัมน์ password_hash ให้ตรงกับใน phpMyAdmin
    const [users]: any = await db.query(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ?', 
      [email]
    )

    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email address not found',
      })
    }

    const user = users[0]

    // 3. ตรวจสอบสถานะบัญชี
    if (user.status === 'pending') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account is pending setup. Please check your email.',
      })
    }

    if (user.status === 'inactive') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account has been disabled. Please contact admin.',
      })
    }

    // 4. ตรวจสอบรหัสผ่าน (ใช้ user.password_hash)
    // bcryptjs.compare จะนำ password ปกติไปเทียบกับค่าที่ถูก Hash ไว้
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordCorrect) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid password',
      })
    }

    // 5. ส่งข้อมูลกลับเมื่อ Login สำเร็จ
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    }

  } catch (error: any) {
    console.error('Login API Error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})