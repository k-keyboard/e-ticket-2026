import { cryptoRandomStringAsync } from 'crypto-random-string'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    try {
        // 1. ตรวจสอบว่ามี User นี้ในระบบจริงไหม
        const [users]: any = await db.query('SELECT id FROM users WHERE email = ?', [email])

        // หากพบผู้ใช้งาน ให้ดำเนินการสร้าง Token และส่งเมล
        if (users.length > 0) {

            // 2. สร้าง Token สุ่ม 64 ตัวอักษร
            const token = await cryptoRandomStringAsync({ length: 64, type: 'alphanumeric' })
            const expires = new Date(Date.now() + 60 * 60 * 1000) // หมดอายุใน 1 ชั่วโมง

            // 3. จัดการ Token ในฐานข้อมูล (ลบของเก่าออกก่อนเพื่อไม่ให้ซ้ำซ้อน)
            await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])
            await db.query(
                'INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
                [email, token, expires]
            )

            // 4. ตั้งค่า Nodemailer Transporter (ดึงค่าจาก Environment Variables)
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: Number(process.env.SMTP_PORT) === 465, // true สำหรับ port 465, false สำหรับอื่นๆ
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            })

            // สร้างลิงก์สำหรับไปหน้าตั้งรหัสผ่านใหม่
            const resetLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

            // 5. ส่งอีเมล
            await transporter.sendMail({
                from: `"System Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Reset Your Password - Lanna Celestial',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Reset Your Password</h2>
                        <p>You requested to reset your password. Please click the button below to proceed:</p>
                        <div style="margin: 30px 0;">
                            <a href="${resetLink}" 
                               style="background-color: #b39359; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                               Reset Password
                            </a>
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="color: #666; font-size: 12px;">${resetLink}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
                    </div>
                `,
            })
        }

        // ตอบกลับแบบเป็นกลางเสมอเพื่อความปลอดภัย
        return {
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.'
        }

    } catch (error: any) {
        console.error('Forgot Password API Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process forgot password request'
        })
    }
})