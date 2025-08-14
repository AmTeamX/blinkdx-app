import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/", "/patients", "/result", "/settings", "/profile"];

// Routes that should redirect authenticated users (like login page)
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware running for:", pathname);

  // Skip middleware for static files, API routes, and Next.js internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("authToken")?.value;
  console.log("Token found:", !!token);

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Check if the current route is an auth route (like login)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  console.log("Route analysis:", { isProtectedRoute, isAuthRoute, pathname });

  // If no token is present
  if (!token) {
    if (isProtectedRoute) {
      console.log("No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Simple token validation - check if it has the right structure
  const isValidToken = isValidJWTStructure(token);
  console.log("Token valid structure:", isValidToken);

  if (isValidToken) {
    // Check if token is expired by decoding payload
    const isExpired = isTokenExpired(token);
    console.log("Token expired:", isExpired);

    if (!isExpired) {
      // Token is valid and not expired
      if (isAuthRoute) {
        console.log("Valid token, redirecting from login to home");
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }
  }

  // Token is invalid or expired
  console.log("Invalid or expired token");

  if (isProtectedRoute) {
    console.log("Clearing invalid token and redirecting to login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("authToken");
    return response;
  }

  // For non-protected routes, just clear the invalid token but allow access
  const response = NextResponse.next();
  response.cookies.delete("authToken");
  return response;
}

function isValidJWTStructure(token: string): boolean {
  try {
    const parts = token.split(".");
    return parts.length === 3;
  } catch {
    return false;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Decode the payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
