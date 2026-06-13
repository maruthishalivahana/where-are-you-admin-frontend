"use client";

import React, { useCallback, useState } from "react";
import LocationSearchInput from "./LocationSearchInput";
import type { LocationResult } from "../services/locationSearch";

type Props = {
    label?: string;
    mapRef?: any;
    onChange?: (loc: { latitude: number; longitude: number } | null, which: "start" | "end") => void;
};

export default function RouteLocationSelector({ label = "Route", mapRef, onChange }: Props) {
    const [start, setStart] = useState<LocationResult | null>(null);
    const [end, setEnd] = useState<LocationResult | null>(null);

    const handleSelect = useCallback(
        (loc: LocationResult, which: "start" | "end") => {
            const coords = { latitude: loc.latitude, longitude: loc.longitude };
            // animate map if available
            try {
                mapRef?.current?.animateToRegion?.(
                    { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                    500
                );
            } catch (e) {
                // ignore
            }
            if (which === "start") {
                setStart(loc);
                onChange?.(coords, "start");
            } else {
                setEnd(loc);
                onChange?.(coords, "end");
            }
        },
        [mapRef, onChange]
    );

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div>
                <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6 }}>Start</label>
                <LocationSearchInput
                    placeholder="Search start location"
                    onLocationSelect={(l) => handleSelect(l, "start")}
                />
                {start && (
                    <div style={{ marginTop: 8, color: "#10b981", fontSize: 13 }}>✓ Location selected</div>
                )}
            </div>

            <div>
                <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6 }}>End</label>
                <LocationSearchInput placeholder="Search end location" onLocationSelect={(l) => handleSelect(l, "end")} />
                {end && <div style={{ marginTop: 8, color: "#10b981", fontSize: 13 }}>✓ Location selected</div>}
            </div>
        </div>
    );
}
