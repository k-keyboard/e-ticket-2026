export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event) // { stock_quantity, is_active }

  try {
    // กรณีถ้ามีการส่งมาเพื่อเปิดการขาย (is_active: 'active')
    if (body.is_active === 'active') {
      // 1. ปิดการขายตั๋วใบอื่นทั้งหมดก่อน (ทุกใบที่ id ไม่ตรงกับใบนี้)
      await db.query(
        "UPDATE tickets SET is_active = 'suspended' WHERE id != ?",
        [id]
      )
    }

    // 2. อัปเดตข้อมูลตั๋วใบปัจจุบัน (รวมถึงจำนวน Stock)
    await db.query(
      'UPDATE tickets SET stock_quantity = ?, is_active = ? WHERE id = ?',
      [body.stock_quantity, body.is_active, id]
    )

    return { message: 'Updated successfully and enforced single-active rule' }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message })
  }
})