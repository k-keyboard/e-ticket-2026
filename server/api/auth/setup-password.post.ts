export default defineEventHandler(async (event) => {
  try {
      // 1. อ่านข้อมูลจาก Body
      const body = await readBody(event)
      console.log('Received body:', body) // จะไปโผล่ใน passenger.log

      const { token, password } = body

      if (!token || !password) {
          throw createError({
              statusCode: 400,
              statusMessage: 'Missing token or password',
          })
      }

      // 2. ทดสอบการเชื่อมต่อ Database หรือ Logic อื่นๆ
      // หากมีการใช้ DB ให้เช็คว่าไฟล์เชื่อมต่อ DB ของคุณใช้ค่าจาก process.env ถูกต้องไหม
      
      // ตัวอย่างการส่งค่ากลับ
      return {
          status: 'success',
          message: 'Password setup completed'
      }

  } catch (error: any) {
      // บันทึก Error ลง log ของ Server
      console.error('API Error:', error)

      // ส่งรายละเอียดกลับไปที่ Frontend (ช่วง Dev ให้ส่ง error.message ไปด้วยจะช่วยได้มาก)
      throw createError({
          statusCode: error.statusCode || 500,
          statusMessage: error.message || 'Internal Server Error',
      })
  }
})