import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock users database - in production, this would be a real database
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'password123', // In production, this would be hashed
    email: 'admin@blinkdx.com',
    role: 'admin' as const,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'doctor',
    password: 'doctor123',
    email: 'doctor@blinkdx.com',
    role: 'user' as const,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    email: 'user@blinkdx.com',
    role: 'user' as const,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // Verify password - in production, use bcrypt.compare()
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h', // Token expires in 24 hours
    });

    // Return success response with user data and token
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
