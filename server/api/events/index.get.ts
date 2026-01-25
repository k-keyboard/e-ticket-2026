export default defineEventHandler(async (event) => {
  try {
    // เรียงลำดับตาม event_time จากน้อยไปมาก (ASC)
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_time ASC');
    return rows;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
});