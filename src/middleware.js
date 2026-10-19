import { NextResponse } from "next/server";

// Redirects must use the public address the visitor used (nginx passes it in
// Host / X-Forwarded-*). request.url carries the app's internal 127.0.0.1 bind address.
function publicUrl(request, path) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return new URL(path, `${proto}://${host}`);
}

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
    return NextResponse.redirect(publicUrl(request, "/login"));
  }

  if (token && pathname === "/") {
    if (onboarding)
      return NextResponse.redirect(publicUrl(request, "/dashboard"));
    else
      return NextResponse.redirect(
        publicUrl(request, "/form-wizard/business-details")
      );
  }

  if (token && pathname.startsWith("/dashboard") && !onboarding) {
    return NextResponse.redirect(
      publicUrl(request, "/form-wizard/business-details")
    );
  }

  if (token && pathname.startsWith("/form-wizard") && onboarding) {
    return NextResponse.redirect(publicUrl(request, "/dashboard"));
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
