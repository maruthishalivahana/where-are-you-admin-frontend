"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    suffix?: string;
    badge: string;
    badgeVariant: "green" | "red" | "neutral";
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
}

export function StatsCard({
    title,
    value,
    suffix,
    badge,
    badgeVariant,
    icon: Icon,
    iconBg,
    iconColor,
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
                <span
                    className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        badgeVariant === "green" && "bg-green-50 text-green-600",
                        badgeVariant === "red" && "bg-red-50 text-red-600",
                        badgeVariant === "neutral" && "bg-gray-100 text-gray-600"
                    )}
                >
                    {badge}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
                {value}
                {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
            </p>
        </div>
    );
}