// server/api/users/index.ts
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
    const method = event.method

    if (method === 'GET') {
        // ใช้ชื่อคอลัมน์ตามจริง: status, role, created_at
        const [rows] = await db.query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC')
        return rows
    }

    if (method === 'POST') {
        const { email, password, role } = await readBody(event)
        try {
            const hashedPassword = await bcrypt.hash(password, 10)
            // ใช้คอลัมน์ password_hash และ status
            const [result]: any = await db.query(
                'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, role || 'traveler', 'active']
            )
            return { id: result.insertId, message: 'User created' }
        } catch (error: any) {
            throw createError({ statusCode: 500, message: 'Email already exists' })
        }
    }
})