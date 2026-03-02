import { cryptoRandomStringAsync } from 'crypto-random-string'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
	// 1. อ่านข้อมูลจาก Request Body
	const body = await readBody(event)
	const { email } = body

	// ตรวจสอบว่ามี Email ส่งมาหรือไม่
	if (!email) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Email is required',
		})
	}

	try {
		// 2. ตรวจสอบผู้ใช้งานในฐานข้อมูล
		// หมายเหตุ: ตัวแปร db ต้องถูกทำ auto-import หรือประกาศไว้ใน server/utils
		const [users]: any = await db.query('SELECT id FROM users WHERE email = ?', [email])

		// เพื่อความปลอดภัย (Security Best Practice): 
		// ไม่ว่าพบอีเมลหรือไม่ เราจะตอบกลับด้วยข้อความ Success แบบเดียวกัน 
		// เพื่อป้องกันผู้ไม่หวังดีสุ่มหาอีเมลที่มีในระบบ (Email Enumeration)
		if (users.length > 0) {

			// 3. สร้าง Token และกำหนดวันหมดอายุ (1 ชั่วโมง)
			const token = await cryptoRandomStringAsync({ length: 64, type: 'alphanumeric' })
			const expires = new Date(Date.now() + 60 * 60 * 1000)

			// 4. บันทึก Token ลงฐานข้อมูล (ลบของเดิมทิ้งก่อนเพื่อความสะอาด)
			await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])
			await db.query(
				'INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
				[email, token, expires]
			)

			// 5. ตั้งค่าการส่งอีเมล
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT),
				secure: Number(process.env.SMTP_PORT) === 465, // ใช้ SSL ถ้าเป็นพอร์ต 465
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
				tls: {
					// ช่วยให้ข้ามปัญหาเรื่อง Self-signed certificate บน Server บางที่
					rejectUnauthorized: false
				}
			})

			const siteUrl = process.env.PUBLIC_SITE_URL || 'https://e-ticket.allkey-services.com'
			const resetLink = `${siteUrl}/setup-password?token=${token}`

			// 6. Template อีเมลธีมพรีเมียม (The Golden Passage)
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
                            <table class="container" width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #d4af37; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <tr>
                                    <td>
                                        <div style="color: #d4af37; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; opacity: 0.8;">YI PENG LANNA</div>
                                        <h2 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 300; letter-spacing: 1px;">Account Recovery</h2>
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 25px 0;"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.7; margin: 0;">
                                            Greetings Traveler,<br><br>
                                            A request was received to reset the password for your <strong>Golden Passage</strong> account. If this was you, please follow the link below to create a new password.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f1d37e 100%); color: #020617; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);">
                                            Reset My Password
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 35px;">
                                        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; line-height: 1.5;">
                                            This link will fade in <strong>1 hour</strong>.<br>
                                            If you did not request this, you may safely ignore this message.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 30px;">
                                        <p style="color: #d4af37; font-size: 10px; letter-spacing: 2px; margin: 0; opacity: 0.6; text-transform: uppercase;">
                                            The Spirit of Lanna Chronicles
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

			// 7. ส่งอีเมลและดักจับ Error เฉพาะส่วน
			try {
				await transporter.sendMail({
					from: `"Yi Peng Lanna Support" <${process.env.SMTP_USER}>`,
					to: email,
					subject: '✦ Reset Your Password - Yi Peng Lanna',
					html: htmlContent,
				})
			} catch (mailError: any) {
				console.error('SMTP Mail Error:', mailError)
				// หากส่งเมลไม่สำเร็จ (เช่น 535) จะโยน error ออกไปให้ catch ด้านล่างจัดการ
				throw new Error(mailError.message)
			}
		}

		// 8. ตอบกลับสำเร็จ
		return {
			success: true,
			message: 'If an account exists for this email, a reset link has been sent.'
		}

	} catch (error: any) {
		// บันทึก Log รายละเอียดที่หน้าจอ Terminal ของ Server เพื่อการ Debug
		console.error('Forgot Password Full Error:', error)

		// ส่ง Response 500 กลับไปหา Client
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
			message: error.message || 'Failed to process request'
		})
	}
})