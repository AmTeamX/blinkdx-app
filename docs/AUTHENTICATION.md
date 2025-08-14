# Authentication System Documentation

## Overview

The BlinkDX application implements a comprehensive authentication system using JWT tokens for secure user access. This system includes login/logout functionality, route protection, and user session management.

## Features

- ✅ Username/Password authentication
- ✅ JWT token-based sessions
- ✅ Protected routes with middleware
- ✅ Automatic token validation
- ✅ Client-side and server-side authentication
- ✅ Secure token storage (cookies + localStorage)
- ✅ Logout functionality with token cleanup
- ✅ Loading states and error handling
- ✅ Responsive login form
- ✅ Navigation with user profile dropdown

## Architecture

### Components

1. **AuthContext**: React context for global authentication state
2. **AuthService**: Service class for API calls and token management
3. **LoginForm**: Reusable login component with validation
4. **ProtectedRoute**: Component wrapper for authenticated routes
5. **Navigation**: Header component with user info and logout
6. **Middleware**: Next.js middleware for route protection

### API Routes

- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification
- `POST /api/auth/logout` - User logout

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Update the following variables:
```env
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production-min-32-chars
NEXT_PUBLIC_API_URL=/api
```

### 2. Dependencies

The following packages are required:
- `js-cookie` - Cookie management
- `jsonwebtoken` - JWT token handling
- `@types/js-cookie` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

### 3. Usage

#### Basic Login Implementation

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  return <LoginForm onSuccess={handleLogin} />;
}
```

#### Protecting Routes

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

#### Using Authentication Hooks

```tsx
import { useAuth, useRole, useLogout } from '@/hooks/useAuth';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useRole();
  const logout = useLogout();

  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      {isAdmin() && <AdminPanel />}
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

## Default Test Users

The system includes mock users for testing:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | admin |
| `doctor` | `doctor123` | user |
| `user` | `user123` | user |

## Security Features

### Token Management
- JWT tokens with 24-hour expiration
- Secure cookie storage with httpOnly flag (production)
- Automatic token cleanup on logout
- Token verification on protected routes

### Password Security
- Minimum 6 character requirement
- Client-side validation
- Server-side password verification
- (Production: bcrypt hashing recommended)

### Route Protection
- Middleware-based route protection
- Automatic redirect to login for unauthorized access
- Protection against accessing login page when authenticated

## File Structure

```
src/
├── components/
│   ├── LoginForm.tsx          # Login form component
│   ├── Navigation.tsx         # Navigation with auth
│   └── ProtectedRoute.tsx     # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── hooks/
│   └── useAuth.ts            # Authentication hooks
├── services/
│   └── authService.ts        # Authentication service
├── types/
│   └── Auth.ts               # TypeScript interfaces
└── app/
    ├── api/auth/             # API routes
    │   ├── login/route.ts
    │   ├── verify/route.ts
    │   └── logout/route.ts
    └── login/
        └── page.tsx          # Login page
```

## API Endpoints

### POST /api/auth/login

Authenticate user with username/password.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@blinkdx.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/verify

Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@blinkdx.com",
    "role": "admin"
  },
  "message": "Token is valid"
}
```

### POST /api/auth/logout

Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Error Handling

The system handles various error scenarios:

- **Invalid credentials**: User-friendly error message
- **Expired tokens**: Automatic logout and redirect
- **Network errors**: Graceful error handling with retry options
- **Missing tokens**: Redirect to login page
- **API failures**: Fallback to local logout

## Production Considerations

### Security Enhancements
1. **Use HTTPS**: Ensure all authentication happens over HTTPS
2. **Hash passwords**: Implement bcrypt for password hashing
3. **Shorter token expiry**: Consider 1-hour tokens with refresh tokens
4. **Token blacklisting**: Implement server-side token blacklist
5. **Rate limiting**: Add rate limiting to login endpoints
6. **CSRF protection**: Implement CSRF tokens for form submissions

### Database Integration
1. Replace mock users with database storage
2. Add user registration functionality
3. Implement password reset flow
4. Add user profile management
5. Track login attempts and sessions

### Monitoring
1. Add authentication event logging
2. Monitor failed login attempts
3. Track session duration
4. Alert on suspicious activities

## Troubleshooting

### Common Issues

**1. "useAuth must be used within an AuthProvider"**
- Ensure components using `useAuth` are wrapped in `<AuthProvider>`
- Check that AuthProvider is in the root layout

**2. Infinite redirect loops**
- Check middleware configuration
- Verify token validation logic
- Ensure public routes are correctly defined

**3. Token not persisting**
- Check localStorage/cookie storage
- Verify domain settings for cookies
- Check browser security settings

**4. API calls failing with 401**
- Verify token format in Authorization header
- Check JWT_SECRET consistency
- Ensure token hasn't expired

### Development Tips

1. Use browser developer tools to inspect stored tokens
2. Check Network tab for authentication API calls
3. Monitor console for authentication errors
4. Use React Developer Tools to inspect auth context state

## Contributing

When contributing to the authentication system:

1. Follow TypeScript best practices
2. Add proper error handling
3. Include loading states for better UX
4. Write comprehensive tests
5. Update documentation for new features
6. Consider backward compatibility

## License

This authentication system is part of the BlinkDX application and follows the same licensing terms.