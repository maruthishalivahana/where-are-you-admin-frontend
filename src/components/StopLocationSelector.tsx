"use client";

import React, { useCallback, useState } from "react";
import LocationSearchInput from "./LocationSearchInput";
import type { LocationResult } from "../services/locationSearch";

type Props = {
    mapRef?: any;
    onChange?: (payload: { name: string; latitude: number; longitude: number; radius: number } | null) => void;
};

export default function StopLocationSelector({ mapRef, onChange }: Props) {
    const [name, setName] = useState("");
    const [selected, setSelected] = useState<LocationResult | null>(null);
    const [radius, setRadius] = useState(50);

    const handleSelect = useCallback(
        (loc: LocationResult) => {
            setSelected(loc);
            try {
                mapRef?.current?.animateToRegion?.(
                    { latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                    500
                );
            } catch (e) { }
            onChange?.({ name, latitude: loc.latitude, longitude: loc.longitude, radius });
        },
        [mapRef, name, radius, onChange]
    );

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div>
                <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6 }}>Stop Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Library Stop"
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }}
                />
            </div>

            <div>
                <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6 }}>Location</label>
                <LocationSearchInput placeholder="Search stop location" onLocationSelect={handleSelect} />
                {selected && <div style={{ marginTop: 8, color: "#10b981", fontSize: 13 }}>✓ Location selected</div>}
            </div>

            <div>
                <label style={{ display: "block", fontSize: 13, color: "#374151", marginBottom: 6 }}>Radius (meters)</label>
                <div style={{ display: "flex", gap: 8 }}>
                    <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} style={{ padding: "8px 10px", borderRadius: 8 }}>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={250}>250</option>
                        <option value={500}>500</option>
                    </select>
                    <div style={{ alignSelf: "center", color: "#6b7280" }}>{radius}m</div>
                </div>
            </div>
        </div>
    );
}
