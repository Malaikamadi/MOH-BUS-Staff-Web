import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { canAccessAdmin, canAccessOffice, canAccessPortal, canAccessSuperAdmin, homeFor } from "@/lib/roles";
import type { UserRole } from "@/types";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/office");
  if (!isProtected) return NextResponse.next();

  const cookie = request.cookies.get(appConfig.session.cookieName)?.value;
  if (!cookie) {
    const login = new URL(routes.login, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const session = JSON.parse(decodeURIComponent(cookie)) as { role?: UserRole; exp?: string };
    if (session.exp && new Date(session.exp).getTime() <= Date.now()) {
      const login = new URL(routes.login, request.url);
      login.searchParams.set("next", pathname);
      const response = NextResponse.redirect(login);
      response.cookies.delete(appConfig.session.cookieName);
      return response;
    }

    const role = session.role;
    if (!role) return NextResponse.redirect(new URL(routes.login, request.url));

    if (pathname.startsWith("/super-admin") && !canAccessSuperAdmin(role)) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (pathname.startsWith("/admin") && !canAccessAdmin(role)) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (pathname.startsWith("/office") && !canAccessOffice(role)) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (pathname.startsWith("/portal") && !canAccessPortal(role)) {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
  } catch {
    const login = new URL(routes.login, request.url);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/super-admin/:path*", "/office/:path*"],
};
