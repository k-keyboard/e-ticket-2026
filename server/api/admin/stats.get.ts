export default defineEventHandler(async (event) => {
    try {
        const [statsRows]: any = await db.query(`
            SELECT 
                /* 1. รายได้รวม (ใช้ payment_status = 'paid' จากตาราง orders) */
                (SELECT IFNULL(SUM(\`total_amount\`), 0) FROM \`orders\` WHERE \`payment_status\` = 'paid') as totalRevenue,
                
                /* 2. จำนวนตั๋วที่ขายได้ทั้งหมด (นับจากรายการใน order_tickets) */
                (SELECT COUNT(*) FROM \`order_tickets\`) as ticketsSold,
                
                /* 3. จำนวนสมาชิกทั้งหมด (จากตาราง users) */
                (SELECT COUNT(*) FROM \`users\`) as totalUsers,
                
                /* 4. จำนวนตั๋วที่ถูกใช้งาน (Scan) แล้วในวันนี้ */
                (SELECT COUNT(*) FROM \`order_tickets\` WHERE \`is_used\` = 1) as redeemedTotal
        `);

        // ดึง 5 ออเดอร์ล่าสุด (ใช้ customer_email ตามโครงสร้างจริงใน SQL)
        const [orderRows]: any = await db.query(`
            SELECT \`id\`, \`customer_email\`, \`total_amount\`, \`payment_status\`, \`created_at\`
            FROM \`orders\` 
            ORDER BY \`created_at\` DESC 
            LIMIT 5
        `);

        const stats = statsRows[0];

        return {
            summary: {
                totalRevenue: Number(stats?.totalRevenue || 0),
                ticketsSold: Number(stats?.ticketsSold || 0),
                totalUsers: Number(stats?.totalUsers || 0),
                redeemedTotal: Number(stats?.redeemedTotal || 0)
            },
            recentOrders: orderRows || []
        }
    } catch (error: any) {
        console.error('SQL Error:', error.message);
        throw createError({
            statusCode: 500,
            message: `Database Error: ${error.message}`
        });
    }
})