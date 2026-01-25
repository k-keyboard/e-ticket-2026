export default defineEventHandler(async (event) => {
  try {
    // ดึงข้อมูลตั๋วทั้งหมดจากตาราง tickets และเรียงตาม ID ล่าสุด
    const [rows] = await db.query('SELECT * FROM tickets ORDER BY id DESC')
    return rows
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Database connection error',
    })
  }
})