import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk Authentication Middleware
 * 
 * Ye middleware har incoming request ko inspect karta hai:
 * 1. Agar route public hai (Landing page, Community gallery, Sign-in), toh request pass ho jati hai.
 * 2. Agar route protected hai (/dashboard, /studio, /api/ai), toh `auth.protect()` user ko sign-in ke liye redirect karta hai.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/community(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Agar request public route par nahi hai, toh authentication enforce karo
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
