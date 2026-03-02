import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // 1. ตั้งค่า Header เพื่อรองรับการเรียกจากต่าง Domain (CORS)
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
  })

  // ข้าม Preflight request (OPTIONS)
  if (isPreflightRequest(event)) {
    return null
  }

  // 2. รับข้อมูลจาก Body
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide email and password',
    })
  }

  try {
    // 3. ค้นหา User จาก Database
    // ใช้ชื่อคอลัมน์ password_hash ตามที่ตั้งไว้ใน DB
    const [users]: any = await db.query(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    // ถ้าไม่พบ User
    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email address not found',
      })
    }

    const user = users[0]

    // 4. ตรวจสอบสถานะบัญชี (Status Check)
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

    // 5. ตรวจสอบรหัสผ่าน (Password Verification)
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordCorrect) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid password',
      })
    }

    // 6. สร้าง JWT Token
    // ดึง Secret Key จาก .env (ถ้าไม่มีให้ใช้ค่า Default ซึ่งไม่แนะนำใน Production)
    const jwtSecret = process.env.JWT_SECRET || 'yi-peng-secret-2026-key'

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' } // Token มีอายุ 24 ชั่วโมง
    )

    // 7. ส่งข้อมูลสำเร็จกลับไปให้ Frontend
    return {
      success: true,
      message: 'Login successful',
      token: token, // ส่ง Token กลับไปเพื่อใช้เก็บใน Cookie/Store
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }

  } catch (error: any) {
    console.error('Login API Error:', error)

    // ส่ง Error กลับไปให้ Client ตามความเหมาะสม
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})