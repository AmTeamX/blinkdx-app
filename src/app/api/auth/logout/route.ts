import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
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
      // Verify the token exists and is valid
      jwt.verify(token, JWT_SECRET);

      // In a production environment, you might want to:
      // 1. Add the token to a blacklist in your database
      // 2. Store invalidated tokens in Redis with expiration
      // 3. Use shorter-lived tokens with refresh tokens

      // For this mock implementation, we'll just return success
      // The client will handle removing the token from storage

      return NextResponse.json({
        success: true,
        message: 'Logout successful',
      });

    } catch (jwtError) {
      // Even if token is invalid, logout should succeed
      // This handles cases where token is already expired
      return NextResponse.json({
        success: true,
        message: 'Logout successful',
      });
    }

  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, logout should succeed on client side
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
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
