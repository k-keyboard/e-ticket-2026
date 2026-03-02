import { cryptoRandomStringAsync } from 'crypto-random-string'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email } = body

    try {
        const [users]: any = await db.query('SELECT id FROM users WHERE email = ?', [email])

        if (users.length > 0) {
            const token = await cryptoRandomStringAsync({ length: 64, type: 'alphanumeric' })
            const expires = new Date(Date.now() + 60 * 60 * 1000)

            await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])
            await db.query(
                'INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
                [email, token, expires]
            )

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            })

            const resetLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

            // เนื้อหา Email แบบ Celestial Theme (Night & Gold Star)
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid rgba(212, 175, 89, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                                <tr>
                                    <td style="padding: 40px 40px 0 40px; text-align: center;">
                                        <div style="color: #d4af59; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 15px; opacity: 0.8;">Lanna Celestial</div>
                                        <h2 style="color: #ffffff; font-size: 26px; font-weight: 300; margin: 0; letter-spacing: 1px;">Restore Access</h2>
                                        <div style="width: 50px; height: 2px; background: #d4af59; margin: 20px auto;"></div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 20px 50px 40px 50px; text-align: center;">
                                        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                                            A request was made to unlock your celestial journey. To set a new password, please follow the light below.
                                        </p>
                                        
                                        <div style="margin: 35px 0;">
                                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #b39359 0%, #e2c07d 100%); color: #020617; padding: 16px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(179, 147, 89, 0.4);">
                                                Reset Password
                                            </a>
                                        </div>

                                        <p style="color: #64748b; font-size: 13px; margin: 0;">
                                            This link will fade in <strong>1 hour</strong>.<br>
                                            If you did not request this, no action is needed.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="background-color: rgba(212, 175, 89, 0.05); padding: 30px; text-align: center; border-top: 1px solid rgba(212, 175, 89, 0.1);">
                                        <p style="color: #d4af59; font-size: 11px; letter-spacing: 2px; margin: 0; opacity: 0.7;">
                                            GUIDED BY THE STARS OF CHIANG MAI
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table width="500" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-top: 20px; text-align: center;">
                                        <p style="color: #475569; font-size: 11px;">
                                            Link not working? Copy this to your browser:<br>
                                            <span style="color: #64748b;">${resetLink}</span>
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
                from: `"Lanna Celestial Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: '✦ Restore Your Password - Lanna Celestial',
                html: htmlContent,
            })
        }

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