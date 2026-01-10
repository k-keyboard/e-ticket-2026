import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // 1. CORS Headers for Cross-Domain requests (Localhost to Server)
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
  })

  // Handle Preflight OPTIONS request
  if (isPreflightRequest(event)) {
    return null
  }

  const body = await readBody(event)
  const { email, password } = body

  try {
    // 2. Check if user exists in the database
    // Assuming 'db' is globally available via your nitro plugins/utils
    const [users]: any = await db.query(
      'SELECT id, email, password, role, status FROM users WHERE email = ?', 
      [email]
    )

    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email address not found',
      })
    }

    const user = users[0]

    // 3. Check Account Status
    if (user.status === 'pending') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account is pending setup. Please check your email.',
      })
    }

    if (user.status === 'inactive') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account has been disabled. Please contact admin.',
      })
    }

    // 4. Verify Password (Comparing plain text with hashed password in DB)
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid password',
      })
    }

    // 5. Successful Response
    // In a production app, you would typically generate a JWT token here
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    }

  } catch (error: any) {
    // Log the actual error on the server for debugging
    console.error('Login API Error:', error)

    // Send the error message back to the frontend
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})