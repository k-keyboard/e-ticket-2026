import nodemailer from 'nodemailer'

export const sendTicketEmail = async (to: string, ticketData: any) => {
    const config = useRuntimeConfig()
    
    // สร้าง Transporter โดยดึงค่าจาก .env (ที่คุณตั้งไว้)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true สำหรับ 465, false สำหรับ 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })

    // ดีไซน์ Template แนว "Celestial Lanna"
    const htmlContent = `
    <div style="background-color: #000c24; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; text-align: center; border: 2px solid #d4af37;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d4af37; letter-spacing: 4px; font-size: 28px;">YI PENG 2025</h1>
            <p style="text-transform: uppercase; letter-spacing: 2px; color: #f2d472;">Your Golden Passage to the Heavens</p>
            
            <div style="margin: 40px 0; border-top: 1px solid #d4af37; border-bottom: 1px solid #d4af37; padding: 20px 0;">
                <h2 style="font-size: 20px;">CONFIRMATION TICKET</h2>
                <p style="font-size: 16px; color: #ffffff;">Order ID: <strong>#${ticketData.orderId}</strong></p>
            </div>

            <div style="text-align: left; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px;">
                <p><strong>Attendee:</strong> ${ticketData.customerName}</p>
                <p><strong>Event:</strong> Yi Peng Lantern Festival 2025</p>
                <p><strong>Venue:</strong> Ban Pao, Mae Taeng</p>
                <p><strong>Date:</strong> November 15, 2025</p>
            </div>

            <div style="margin: 40px 0;">
                <p style="color: #d4af37;">Please present the QR Code at the entrance</p>
                <div style="background: white; padding: 15px; display: inline-block; border-radius: 10px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.orderId}" alt="QR Code" />
                </div>
            </div>

            <p style="font-size: 12px; color: #999;">If you have any questions, please contact us at e-ticket@allkey-services.com</p>
            <p style="font-size: 12px; color: #d4af37;">© 2026 The Spirit of Lanna Chronicles</p>
        </div>
    </div>
    `

    await transporter.sendMail({
        from: `"Yi Peng 2025" <${process.env.SMTP_USER}>`,
        to: to,
        subject: "Your Golden Ticket to Yi Peng 2025 ✦",
        html: htmlContent,
    })
}