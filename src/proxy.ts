import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";

/**
 * Optimistic route protection. Full authorisation is still enforced by the
 * backend; this only keeps unauthenticated browsers off the portals.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/portal");
  if (!isProtected) return NextResponse.next();

  const cookie = request.cookies.get(appConfig.session.cookieName)?.value;
  if (!cookie) {
    const login = new URL(routes.login, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const session = JSON.parse(decodeURIComponent(cookie)) as { role?: string; exp?: string };
    if (session.exp && new Date(session.exp).getTime() <= Date.now()) {
      const login = new URL(routes.login, request.url);
      login.searchParams.set("next", pathname);
      const response = NextResponse.redirect(login);
      response.cookies.delete(appConfig.session.cookieName);
      return response;
    }
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL(routes.portal.dashboard, request.url));
    }
  } catch {
    const login = new URL(routes.login, request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
