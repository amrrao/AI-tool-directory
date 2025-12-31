import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Skip middleware for API routes - they handle their own auth
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  
  // Skip middleware for auth callback - needed for email confirmation
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  
  // Skip middleware for static files
  const isStaticFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/);
  
  // Allow API routes, auth callbacks, and static files to pass through
  if (isApiRoute || isAuthCallback || isStaticFile) {
    return response;
  }

  // Define auth routes that should redirect authenticated users
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to home if accessing auth routes while authenticated
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Note: If you want to protect specific routes in the future, add them here:
  // const protectedRoutes = ["/admin", "/settings"];
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route)
  // );
  // if (isProtectedRoute && !user) {
  //   const redirectUrl = new URL("/auth/signin", request.url);
  //   redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
  //   return NextResponse.redirect(redirectUrl);
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

