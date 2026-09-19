import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateCurrentUser } from "@/lib/auth";

/**
 * Protected Dashboard Layout (Server Component)
 * 
 * Ye layout ensure karta hai ki user authenticated ho.
 * Agar user login nahi hai toh Clerk middleware aur ye check automatically sign-in par redirect karenge.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure user is synced in database
  await getOrCreateCurrentUser();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
}
