"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const AUTH_PATHS = ["/login", "/signup"];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { token, isLoading } = useAuth();
    const isAuthPage = AUTH_PATHS.includes(pathname);

    // If user is already logged in and visits auth pages, redirect to dashboard
    useEffect(() => {
        if (!isLoading && token && isAuthPage) {
            router.replace("/Dashboard");
        }
    }, [token, isLoading, isAuthPage, router]);

    // Auth pages: plain layout, no sidebar
    if (isAuthPage) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    // All other pages: wrap with ProtectedRoute + AppShell
    return (
        <ProtectedRoute>
            <AppShell>{children}</AppShell>
        </ProtectedRoute>
    );
}
