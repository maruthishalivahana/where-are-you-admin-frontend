"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth();
    const router = useRouter();

    // Also check localStorage directly to avoid a race condition where
    // router.replace("/Dashboard") fires before React flushes setToken.
    const hasToken =
        token !== null ||
        (typeof window !== "undefined" && !!localStorage.getItem("token"));

    useEffect(() => {
        if (!isLoading && !hasToken) {
            router.replace("/login");
        }
    }, [hasToken, isLoading, router]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    if (!hasToken) return null;

    return <>{children}</>;
}
