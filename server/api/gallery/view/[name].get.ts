import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const fileName = getRouterParam(event, 'name')
    const filePath = path.resolve(process.cwd(), '../uploads_data/gallery', fileName!)

    if (!fs.existsSync(filePath)) {
        throw createError({ statusCode: 404, message: 'Image not found' })
    }

    // อ่านไฟล์และส่งกลับไปเป็น Buffer พร้อม Header ที่ถูกต้อง
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()

    const mimeTypes: any = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
    }

    setResponseHeader(event, 'Content-Type', mimeTypes[ext] || 'application/octet-stream')
    return fileBuffer
})