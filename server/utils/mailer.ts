import nodemailer from 'nodemailer'

export const sendTicketEmail = async (to: string, ticketData: {
    orderId: string | number,
    customerName: string,
}) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false }
    })

    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'
    const myTicketsUrl = `${siteUrl}/my-tickets`

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Reset สำหรับ Email Client */
            body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; background-color: #020617; }
            img { line-height: 100%; text-decoration: none; border: 0; outline: none; }
            
            /* Responsive Styles */
            @media screen and (max-width: 600px) {
                .container { width: 90% !important; padding: 25px !important; border-radius: 16px !important; }
                .title { font-size: 24px !important; }
                .info-label { width: 80px !important; font-size: 13px; }
                .info-value { font-size: 13px !important; }
                .btn { width: 100% !important; box-sizing: border-box; padding: 15px !important; }
            }
        </style>
    </head>
    <body style="background-color: #020617; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table class="container" width="550" border="0" cellspacing="0" cellpadding="0" 
                           style="background-color: #0f172a; border: 1px solid #d4af37; border-radius: 24px; padding: 40px; text-align: center;">
                        
                        <tr>
                            <td align="center">
                                <span style="display: inline-block; padding: 4px 12px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 50px; color: #d4af37; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
                                    Celestial Admission
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <h1 class="title" style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 15px 0 5px 0; letter-spacing: 1px;">
                                    YI PENG LANNA
                                </h1>
                                <div style="color: #d4af37; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 25px;">
                                    Experience 2026
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0;">
                                <div style="height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent);"></div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 20px 0;">
                                <p style="color: #ffffff; font-size: 17px; margin: 0;">Your Golden Passage is Confirmed</p>
                            </td>
                        </tr>

                        <tr>
                            <td align="left" style="background: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
                                <table width="100%" border="0" cellspacing="0" cellpadding="5">
                                    <tr>
                                        <td class="info-label" width="90" style="color: #d4af37; font-weight: bold; font-size: 14px;">Order:</td>
                                        <td class="info-value" style="color: #ffffff; font-size: 14px;">#${ticketData.orderId}</td>
                                    </tr>
                                    <tr>
                                        <td class="info-label" style="color: #d4af37; font-weight: bold; font-size: 14px;">Attendee:</td>
                                        <td class="info-value" style="color: #ffffff; font-size: 14px;">${ticketData.customerName}</td>
                                    </tr>
                                    <tr>
                                        <td class="info-label" style="color: #d4af37; font-weight: bold; font-size: 14px;">Date:</td>
                                        <td class="info-value" style="color: #ffffff; font-size: 14px;">Nov 24 - 25, 2026</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding: 35px 0 20px 0;">
                                <div style="background: white; padding: 12px; display: inline-block; border-radius: 12px; box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.orderId}" 
                                         width="150" height="150" style="display: block;" alt="QR Code" />
                                </div>
                                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 15px;">Please present this QR code at the entrance</p>
                            </td>
                        </tr>

                        <tr>
                            <td align="center">
                                <a href="${myTicketsUrl}" class="btn" 
                                   style="display: inline-block; background-color: #d4af37; color: #020617 !important; padding: 16px 35px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 15px;">
                                   ACCESS YOUR TICKETS
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td class="footer" style="color: rgba(255, 255, 255, 0.3); font-size: 11px; font-style: italic; margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 25px;">
                                © 2026 The Spirit of Lanna Chronicles.<br>
                                Chiang Mai, Thailand.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `

    return await transporter.sendMail({
        from: `"Yi Peng Lanna" <${process.env.SMTP_USER}>`,
        to: to,
        subject: `✦ Your Golden Ticket - #${ticketData.orderId}`,
        html: htmlContent,
    })
}