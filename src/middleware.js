import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const onboarding =
    request.cookies.get("on_boarding_exists")?.value === "true";
  const { pathname } = request.nextUrl;

  const authPages = ["/login", "/signup", "/"];

  if (
    !token &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/form-wizard"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/") {
    if (onboarding)
      return NextResponse.redirect(new URL("/dashboard", request.url));
    else
      return NextResponse.redirect(
        new URL("/form-wizard/business-details", request.url)
      );
  }

  if (token && pathname.startsWith("/dashboard") && !onboarding) {
    return NextResponse.redirect(
      new URL("/form-wizard/business-details", request.url)
    );
  }

  if (token && pathname.startsWith("/form-wizard") && onboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (authPages.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/form-wizard/:path*",
  ],
};
