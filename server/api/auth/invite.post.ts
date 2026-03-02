import nodemailer from 'nodemailer'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, role } = body

    try {
        // 1. ตรวจสอบ Role (จำกัดเฉพาะ traveler)
        if (role !== 'traveler') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid Role: Only Traveler registration is allowed.'
            })
        }

        const [existing]: any = await db.query('SELECT id, status FROM users WHERE email = ?', [email])

        if (existing.length > 0) {
            if (existing[0].status === 'active') {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'This email is already registered and active.'
                })
            }
        } else {
            await db.query('INSERT INTO users (email, role, status) VALUES (?, ?, "pending")', [email, role])
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])
        await db.query('INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt])

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465, // ใช้ SSL ถ้า port คือ 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        })

        const setupLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

        // เนื้อหา Email แบบพรีเมียม (Theme: The Golden Passage)
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="550" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #d4af37; border-radius: 24px; overflow: hidden; text-align: center;">
                            <tr>
                                <td style="padding: 40px 40px 20px 40px;">
                                    <div style="color: #d4af37; font-size: 13px; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 10px;">The Golden Passage</div>
                                    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 300; letter-spacing: 1px;">Welcome to Yi Peng</h1>
                                    <div style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 30px auto; width: 80%;"></div>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="padding: 0 50px 30px 50px;">
                                    <p style="color: rgba(255,255,255,0.9); font-size: 17px; line-height: 1.7; margin: 0;">
                                        Your journey to the Festival of Lights begins here. You have been registered to join our sacred celebration in Chiang Mai.
                                    </p>
                                    <p style="color: rgba(255,255,255,0.6); font-size: 15px; margin-top: 15px;">
                                        Please secure your account by setting up your password to access your digital tickets and event details.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 10px 0 40px 0;">
                                    <a href="${setupLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f1d37e 100%); color: #020617; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                                        Secure My Account
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td style="background-color: rgba(0,0,0,0.2); padding: 30px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
                                    <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; line-height: 1.5;">
                                        For your security, this invitation will expire in 24 hours.<br>
                                        If you did not expect this invitation, please ignore this message.
                                    </p>
                                    <p style="color: #d4af37; font-size: 10px; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase;">
                                        Chiang Mai, Thailand
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `

        await transporter.sendMail({
            from: `"Yi Peng Lanna" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '✧ Begin Your Journey: Set Up Your Account Password',
            html: htmlContent,
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