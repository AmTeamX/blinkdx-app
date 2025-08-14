import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock users database - in production, this would be a real database
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'password123',
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Find user in database to ensure they still exist
      const user = mockUsers.find(u => u.id === decoded.userId);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found',
          },
          { status: 401 }
        );
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        message: 'Token is valid',
      });

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification API error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
