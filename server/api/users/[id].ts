export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const method = event.method

    if (method === 'PUT') {
        const { email, role } = await readBody(event)
        try {
            await db.query('UPDATE users SET email = ?, role = ? WHERE id = ?', [email, role, id])
            return { message: 'User updated' }
        } catch (error: any) {
            throw createError({ statusCode: 500, message: error.message })
        }
    }

    if (method === 'DELETE') {
        try {
            await db.query('DELETE FROM users WHERE id = ?', [id])
            return { message: 'User deleted' }
        } catch (error: any) {
            throw createError({ statusCode: 500, message: error.message })
        }
    }
})