import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/signin", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  const authToken = req.cookies.get("authToken");

  try {
    // Verify the token if it exists
    if (authToken) {
      // Get the full URL using req.nextUrl.origin to make the API request absolute
      const apiUrl = `${req.nextUrl.origin}/api/verifyToken`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify token");
      }
      const decodedToken = await response.json();

      // Redirect authenticated users from public routes to "/dashboard"
      if (isPublicRoute && decodedToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } else if (isProtectedRoute) {
      // If no token and trying to access a protected route, redirect to signin
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  } catch (error) {
    console.error("Token verification error:", error);

    // Redirect to signin if token verification fails on a protected route
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
