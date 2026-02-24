"use client";

import { CheckCircle, UserCircle, AlertTriangle, Wrench, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
    {
        id: 1,
        icon: CheckCircle,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "Bus 402 started",
        subtitle: "Route 12B - North Line",
        time: "2 mins ago",
    },
    {
        id: 2,
        icon: UserCircle,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "Driver John online",
        subtitle: "Assigned to Vehicle #88",
        time: "12 mins ago",
    },
    {
        id: 3,
        icon: AlertTriangle,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        title: "Traffic Delay Alert",
        subtitle: "Broadway St - All routes +10m",
        time: "45 mins ago",
    },
    {
        id: 4,
        icon: Wrench,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        title: "Bus #201 Maintenance",
        subtitle: "Scheduled inspection complete",
        time: "1 hour ago",
    },
    {
        id: 5,
        icon: LogOut,
        iconBg: "bg-gray-100",
        iconColor: "text-gray-500",
        title: "Driver Sarah offline",
        subtitle: "Shift ended successfully",
        time: "3 hours ago",
    },
];

export function RecentActivity() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All
                </button>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {activities.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", item.iconBg)}>
                                <Icon className={cn("w-4 h-4", item.iconColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}