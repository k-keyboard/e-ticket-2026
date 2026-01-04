import nodemailer from 'nodemailer'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, role } = body // role: 'traveler', 'staff', 'owner'

  try {
    // 1. ตรวจสอบหรือสร้าง User
    console.log('object');
    const [existing]: any = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length === 0) {
      await db.query('INSERT INTO users (email, role, status) VALUES (?, ?, "pending")', [email, role])
    }

    // 2. สร้าง Token และวันหมดอายุ (24 ชม.)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.query('INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)', 
      [email, token, expiresAt])

    // 3. ตั้งค่า Nodemailer ตามรูปภาพ DirectAdmin (Port 587)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // false สำหรับพอร์ต 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // ช่วยให้เชื่อมต่อกับ Hosting ได้เสถียรขึ้น
      }
    })

    const setupLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

    // 4. ส่งอีเมล
    await transporter.sendMail({
      from: `"E-Ticket Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'ตั้งค่ารหัสผ่านใหม่สำหรับระบบ E-Ticket',
      html: `<h3>สวัสดีครับ</h3>
             <p>คุณได้รับเชิญให้เข้าร่วมระบบในฐานะ <b>${role}</b></p>
             <p>กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านภายใน 24 ชม.:</p>
             <a href="${setupLink}">${setupLink}</a>`
    })

    return { success: true, message: 'ส่งอีเมลเรียบร้อยแล้ว' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})