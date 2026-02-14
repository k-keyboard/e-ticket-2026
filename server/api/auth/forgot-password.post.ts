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

			// เนื้อหา Email แบบพรีเมียม
			const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @media screen and (max-width: 600px) {
                        .container { width: 95% !important; padding: 20px !important; }
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table class="container" width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #d4af37; border-radius: 20px; padding: 40px; text-align: center;">
                                <tr>
                                    <td>
                                        <div style="color: #d4af37; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px;">YI PENG LANNA</div>
                                        <h2 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 300; letter-spacing: 1px;">Account Recovery</h2>
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 25px 0;"></div>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0;">
                                            Greetings Traveler,<br><br>
                                            We received a request to reset the password for your Golden Passage account. If this was you, please click the button below to set a new password.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <a href="${resetLink}" style="display: inline-block; background-color: #d4af37; color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-top: 35px;">
                                        <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0;">
                                            This link will expire in <strong>1 hour</strong>.<br>
                                            If you did not request this, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 30px;">
                                        <p style="color: #d4af37; font-size: 11px; letter-spacing: 1px; margin: 0; opacity: 0.6;">
                                            THE SPIRIT OF LANNA CHRONICLES
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
				subject: '✦ Reset Your Password - Yi Peng Lanna',
				html: htmlContent,
			})
		}

		return { message: 'Reset link sent if account exists.' }

	} catch (error: any) {
		console.error('Forgot Password Error:', error)
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
	}
})