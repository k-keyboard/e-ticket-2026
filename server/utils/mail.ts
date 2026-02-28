import nodemailer from 'nodemailer'

export const sendConfirmationEmail = async (data: {
  email: string,
  orderId: number,
  customerName: string,
  items: any[]
}) => {
  // 1. สร้าง Transporter โดยดึงค่าจาก .env ตามชื่อที่คุณตั้งไว้ในรูปภาพ
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: Number(process.env.SMTP_PORT), 
    secure: Number(process.env.SMTP_PORT) === 465, 
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.SMTP_PASS, 
    },
    tls: {
      // สำคัญ: ป้องกันปัญหาการปฏิเสธการเชื่อมต่อจาก Mail Server บางแห่ง
      rejectUnauthorized: false
    }
  })

  // ดึง URL ของหน้า My Tickets จาก .env (PUBLIC_SITE_URL ตามในรูป)
  const siteUrl = process.env.PUBLIC_SITE_URL
  const myTicketsUrl = `${siteUrl}/my-tickets`

  // 2. ออกแบบ HTML Email (Theme: Yi Peng Lanna - Gold & Night)
  const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                .email-wrapper { background-color: #020617; padding: 40px; font-family: 'Helvetica', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 24px; background-color: #0f172a; padding: 40px; text-align: center; }
                .gold-text { color: #d4af37; letter-spacing: 2px; }
                .title { color: #ffffff; font-size: 28px; font-weight: 800; margin: 20px 0; }
                .divider { height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 30px 0; }
                .content { color: rgba(255, 255, 255, 0.8); line-height: 1.6; font-size: 16px; }
                .btn { display: inline-block; background-color: #d4af37; color: #020617 !important; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 800; margin: 30px 0; }
                .footer { color: rgba(255, 255, 255, 0.4); font-size: 12px; font-style: italic; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="container">
                    <div class="gold-text">THE GOLDEN PASSAGE</div>
                    <h1 class="title">YI PENG LANNA 2026</h1>
                    
                    <div class="divider"></div>
                    
                    <div class="content">
                        <p>Dear ${data.customerName},</p>
                        <p>Your celestial journey is confirmed. Your order <strong>#${data.orderId}</strong> has been processed successfully.</p>
                    </div>

                    <a href="${myTicketsUrl}" class="btn">VIEW MY TICKETS</a>

                    <p class="content">Please present the QR Code at the festival entrance.</p>
                    
                    <div class="footer">
                        This is an automated message, please do not reply directly to this email.
                    </div>
                </div>
            </div>
        </body>
        </html>
    `

  // 3. ส่งอีเมล
  return await transporter.sendMail({
    from: `"Yi Peng Lanna Festival" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: `Your Yi Peng 2026 Confirmation - Order #${data.orderId}`,
    html: htmlContent,
  })
}