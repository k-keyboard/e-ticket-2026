export default defineEventHandler((event) => {
  // รับค่า Origin จาก Header ที่ส่งมา
  const origin = getHeader(event, 'origin')
  
  // กำหนด Headers
  if (origin) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    })
  }

  // สำคัญ: จัดการคำขอ OPTIONS (Preflight)
  if (isPreflightRequest(event)) {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = 'No Content'
    return ""
  }
})