"use client";

import { RefreshCw, Maximize2 } from "lucide-react";

export function FleetMap() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <h2 className="text-base font-semibold text-gray-900">Live Fleet Tracking</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Refresh Map</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 text-xs sm:text-sm text-white hover:bg-blue-700 transition-colors font-medium">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Expand View</span>
                    </button>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-64 sm:h-80 bg-[#e8f0e8] rounded-xl overflow-hidden border border-gray-100">
                {/* Grid lines to simulate map */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    opacity="0.3"
                >
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9db4a0" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Simulated roads */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="150" x2="100%" y2="150" stroke="#c8d8c8" strokeWidth="8" />
                    <line x1="0" y1="240" x2="100%" y2="240" stroke="#c8d8c8" strokeWidth="5" />
                    <line x1="200" y1="0" x2="200" y2="100%" stroke="#c8d8c8" strokeWidth="8" />
                    <line x1="350" y1="0" x2="350" y2="100%" stroke="#c8d8c8" strokeWidth="5" />
                    <line x1="500" y1="0" x2="500" y2="100%" stroke="#c8d8c8" strokeWidth="5" />
                    <line x1="0" y1="80" x2="100%" y2="80" stroke="#c8d8c8" strokeWidth="3" />
                    <rect x="220" y="30" width="110" height="100" rx="4" fill="#d4e4d4" stroke="#b8ccb8" strokeWidth="1" />
                    <rect x="360" y="30" width="120" height="100" rx="4" fill="#d4e4d4" stroke="#b8ccb8" strokeWidth="1" />
                    <rect x="220" y="165" width="110" height="60" rx="4" fill="#c8d8c8" stroke="#b8ccb8" strokeWidth="1" />
                </svg>

                {/* Bus markers */}
                {/* Bus 402 - Normal */}
                <div className="absolute top-[35%] left-[25%] flex flex-col items-center gap-1">
                    <div className="bg-white text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-gray-200">
                        Bus 402
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" /></svg>
                    </div>
                </div>

                {/* Bus 55 - Delayed */}
                <div className="absolute top-[60%] left-[42%] flex flex-col items-center gap-1">
                    <div className="bg-white text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-gray-200">
                        Bus 55
                    </div>
                    <div className="w-7 h-7 rounded-full bg-yellow-500 border-2 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" /></svg>
                    </div>
                </div>

                {/* Bus 118 - Normal */}
                <div className="absolute top-[42%] left-[60%] flex flex-col items-center gap-1">
                    <div className="bg-white text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-gray-200">
                        Bus 118
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" /></svg>
                    </div>
                </div>

                {/* City label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-600 opacity-20 pointer-events-none select-none">
                    Chicago
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">Normal Operations</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs text-gray-500 font-medium">Emergency / Out of Service</span>
                </div>
            </div>
        </div>
    );
}