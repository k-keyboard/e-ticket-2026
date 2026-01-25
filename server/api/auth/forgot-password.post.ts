import { cryptoRandomStringAsync } from 'crypto-random-string'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const { email } = body

	try {
		// 1. ตรวจสอบว่ามี User นี้ในระบบจริงไหม
		const [users]: any = await db.query('SELECT id FROM users WHERE email = ?', [email])

		// เพื่อความปลอดภัย: ไม่ควรบอกว่า "ไม่พบอีเมล" 
		// ให้ตอบ success เสมอเพื่อป้องกันการสุ่มหาอีเมลในระบบ (Email Harvesting)
		if (users.length > 0) {
			// 2. สร้าง Token สุ่ม
			const token = await cryptoRandomStringAsync({ length: 64, type: 'alphanumeric' })
			const expires = new Date(Date.now() + 60 * 60 * 1000) // หมดอายุใน 1 ชม.

			// 3. บันทึก Token ลงตาราง (ลบของเก่าทิ้งก่อนถ้ามี)
			await db.query('DELETE FROM verification_tokens WHERE email = ?', [email])
			await db.query(
				'INSERT INTO verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
				[email, token, expires]
			)

			// 4. ส่งอีเมล (ใช้ SMTP จาก .env)
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT),
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			})

			const resetLink = `${process.env.PUBLIC_SITE_URL}/setup-password?token=${token}`

			await transporter.sendMail({
				from: `"E-Ticket Support" <${process.env.SMTP_USER}>`,
				to: email,
				subject: 'Reset Your Password',
				html: `<p>Click the link below to reset your password:</p>
			   <a href="${resetLink}">${resetLink}</a>
			   <p>This link will expire in 1 hour.</p>`,
			})
		}

		return { message: 'Reset link sent if account exists.' }

	} catch (error: any) {
		console.error('Forgot Password Error:', error)
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
	}
})