"use client";

import React, { useEffect, useRef, useState } from "react";
import { autocompletePlaces, getPlaceDetails } from "../services/locationSearch";
import type { LocationResult } from "../services/locationSearch";

type Props = {
    value?: string;
    placeholder?: string;
    onLocationSelect: (loc: LocationResult) => void;
    className?: string;
};

export default function LocationSearchInput({
    value = "",
    placeholder = "Search location...",
    onLocationSelect,
    className = "",
}: Props) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setOpen(false);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(async () => {
            try {
                const preds = await autocompletePlaces(query);
                setResults(preds || []);
                setOpen(true);
                setActiveIndex(0);
            } catch (err: any) {
                setError(err?.message || "Search failed");
                setResults([]);
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }, 500);
    }, [query]);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((s) => Math.min(s + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((s) => Math.max(s - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const sel = results[activeIndex];
            if (sel) selectLocationPrediction(sel);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    async function selectLocationPrediction(pred: any) {
        setLoading(true);
        setOpen(false);
        try {
            const placeId = pred.place_id;
            const details = await getPlaceDetails(placeId);
            setQuery(details.displayName || pred.description || "");
            onLocationSelect(details as LocationResult);
        } catch (err: any) {
            setError(err?.message || "Failed to get place details");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "relative" }} ref={wrapperRef} className={className}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                }}
            >
                <input
                    aria-label="location-search"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKey}
                    onFocus={() => query && setOpen(true)}
                    style={{
                        outline: "none",
                        border: "none",
                        background: "transparent",
                        width: "100%",
                        fontSize: 14,
                        padding: 0,
                    }}
                />
                <div style={{ width: 18, height: 18, opacity: 0.9 }}>
                    {loading ? (
                        <div style={{ width: 18, height: 18, borderRadius: 9, border: "2px solid #ccc", borderTopColor: "#333", animation: "spin 1s linear infinite" }} />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="6" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    )}
                </div>
            </div>

            {open && (
                <div
                    role="listbox"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        borderRadius: 12,
                        background: "white",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                        overflow: "hidden",
                        maxHeight: 320,
                    }}
                >
                    {error ? (
                        <div style={{ padding: 12, color: "#b91c1c" }}>Error: {error}</div>
                    ) : results.length === 0 && !loading ? (
                        <div style={{ padding: 12, color: "#6b7280" }}>No locations found</div>
                    ) : (
                        results.map((r: any, i: number) => (
                            <div
                                key={`${r.place_id || i}`}
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => selectLocationPrediction(r)}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    padding: 12,
                                    cursor: "pointer",
                                    background: i === activeIndex ? "#f3f4f6" : "transparent",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /></svg>
                                    <span style={{ color: "#111827", fontSize: 14 }}>{r.description || r.displayName}</span>
                                </div>
                                <div style={{ color: "#6b7280", fontSize: 12 }}>{r.structured_formatting?.secondary_text || ""}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
