"use client";

import { ChevronDown } from "lucide-react";

const weekData = [
    { day: "Mon", buses: 110, drivers: 78 },
    { day: "Tue", buses: 118, drivers: 82 },
    { day: "Wed", buses: 122, drivers: 85 },
    { day: "Thu", buses: 115, drivers: 80 },
    { day: "Fri", buses: 124, drivers: 86 },
    { day: "Sat", buses: 95, drivers: 65 },
    { day: "Sun", buses: 88, drivers: 60 },
];

const maxVal = 150;

export function WeeklyTrend() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Weekly Usage Trend</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Bus and driver activity overview</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                    Last 7 Days
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Chart */}
            <div className="h-48 sm:h-56 flex items-end gap-1.5 sm:gap-4 px-1 sm:px-2">
                {weekData.map(({ day, buses, drivers }) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-full flex items-end gap-0.5 sm:gap-1 h-36 sm:h-44">
                            {/* Buses bar */}
                            <div
                                className="flex-1 bg-blue-500 rounded-t-md transition-all duration-700 hover:bg-blue-600"
                                style={{ height: `${(buses / maxVal) * 100}%` }}
                                title={`Buses: ${buses}`}
                            />
                            {/* Drivers bar */}
                            <div
                                className="flex-1 bg-blue-200 rounded-t-md transition-all duration-700 hover:bg-blue-300"
                                style={{ height: `${(drivers / maxVal) * 100}%` }}
                                title={`Drivers: ${drivers}`}
                            />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">{day}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">Active Buses</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-blue-200 shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">Online Drivers</span>
                </div>
            </div>
        </div>
    );
}