import nodemailer from 'nodemailer'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, role } = body

    try {
        // 1. ตรวจสอบ Role (จำกัดเฉพาะ traveler เท่านั้น)
        if (role !== 'traveler') {
            throw createError({
                statusCode: 400,
                statusMessage: 'บทบาทไม่ถูกต้อง: เฉพาะผู้ใช้ทั่วไป (Traveler) เท่านั้นที่สามารถสมัครผ่านช่องทางนี้ได้'
            })
        }

        // 2. ตรวจสอบ User และสถานะ
        const [existing]: any = await db.query('SELECT id, status FROM users WHERE email = ?', [email])

        if (existing.length > 0) {
            if (existing[0].status === 'active') {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'อีเมลนี้ได้ทำการตั้งรหัสผ่านและใช้งานระบบอยู่แล้ว'
                })
            }
        } else {
            await db.query('INSERT INTO users (email, role, status) VALUES (?, ?, "pending")', [email, role])
        }

        // 3. สร้าง Token และวันหมดอายุ (24 ชม.)
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // ลบ Token เก่าที่เคยค้างอยู่
        await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])

        await db.query('INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt])

        // 4. ตั้งค่า Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const setupLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

        // 5. Send Email in English
        await transporter.sendMail({
            from: `"E-Ticket Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Action Required: Set Up Your E-Ticket Account Password',
            html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #1890ff; text-align: center;">Welcome to E-Ticket!</h2>
            <p>Hi there,</p>
            <p>You have been registered as a <b>Traveler</b> in our system. To get started and access your tickets, please set up your account password by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" style="background-color: #1890ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Set Up My Password
              </a>
            </div>
  
            <p>Alternatively, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${setupLink}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 13px; color: #888;">
              * This link will expire in <b>24 hours</b> for security reasons.<br>
              If you did not request this, please ignore this email.
            </p>
          </div>
        `
        })

        return { success: true, message: 'ส่งอีเมลตั้งค่ารหัสผ่านเรียบร้อยแล้ว' }

    } catch (error: any) {
        console.error('Invite Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || error.message
        })
    }
})