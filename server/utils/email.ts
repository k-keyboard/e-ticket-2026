import nodemailer from 'nodemailer'
import * as QRCode from 'qrcode'

export const sendConfirmationEmail = async (order: {
    email: string,
    orderId: string | number,
    customerName: string,
    items: any[]
}) => {
    // 1. สร้าง QR Code เป็น Base64
    const qrCodeDataUrl = await QRCode.toDataURL(order.orderId.toString());

    // 2. ตั้งค่า Transport โดยใช้ค่า SMTP ของคุณ
    const transporter = nodemailer.createTransport({
        host: "mail.allkey-services.com",
        port: 587,
        secure: false, // ใช้ false สำหรับ port 587 (TLS)
        auth: {
            user: "e-ticket@allkey-services.com",
            pass: "e-ticket2026",
        },
        tls: {
            // ป้องกันปัญหาเรื่อง Certificate ในบาง Server
            rejectUnauthorized: false
        }
    });

    // 3. เนื้อหาอีเมลสไตล์ล้านนา
    const htmlContent = `
        <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #001529; padding: 20px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0;">LANNA FEST 2026</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #333;">ยืนยันการชำระเงินสำเร็จ</h2>
                <p>เรียนคุณ <strong>${order.customerName}</strong>,</p>
                <p>การจองตั๋วของคุณเสร็จสมบูรณ์แล้ว โปรดเก็บรหัสออเดอร์และ QR Code นี้ไว้สำหรับเข้างาน</p>
                
                <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.orderId}</p>
                    <p style="margin: 5px 0;"><strong>รายการ:</strong></p>
                    <ul style="margin: 5px 0;">
                        ${order.items.map(item => `<li>${item.description} x ${item.quantity}</li>`).join('')}
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-weight: bold; color: #001529;">QR CODE สำหรับเข้างาน</p>
                    <img src="cid:ticket_qrcode" alt="QR Code" style="width: 180px; border: 4px solid #001529; border-radius: 8px;" />
                    <p style="font-size: 12px; color: #999; margin-top: 10px;">(รหัสออเดอร์: ${order.orderId})</p>
                </div>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>หากมีข้อสงสัยโปรดติดต่อ info@allkey-services.com</p>
            </div>
        </div>
    `;

    // 4. ส่งอีเมลออก
    await transporter.sendMail({
        from: '"Lanna Fest E-Ticket" <e-ticket@allkey-services.com>',
        to: order.email,
        subject: `ยืนยันการซื้อตั๋ว #${order.orderId} - Lanna Fest 2026`,
        html: htmlContent,
        attachments: [
            {
                filename: 'ticket-qr.png',
                content: qrCodeDataUrl.split("base64,")[1],
                encoding: 'base64',
                cid: 'ticket_qrcode' 
            }
        ]
    });
}