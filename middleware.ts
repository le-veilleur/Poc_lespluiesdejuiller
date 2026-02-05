import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";



// Routes qui necessitent une authentification
const PROTECTED_ROUTES = ["/api/tickets", "/api/planning", "/api/cart", "/api/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne verifier que les routes API
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // GET /api/conferences est public, POST necessite auth (geree dans la route)
  if (pathname.startsWith("/api/conferences") && request.method === "GET") {
    return NextResponse.next();
  }

  // Verifier la presence du token pour les routes protegees
  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    (pathname.startsWith("/api/conferences") && request.method !== "GET");

  if (isProtected) {
    const token = request.cookies.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token d'authentification requis" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Appliquer le middleware uniquement aux routes API
  matcher: "/api/:path*",
};
