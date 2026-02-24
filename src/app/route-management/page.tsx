"use client";

import { useState, useCallback, useEffect } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    DirectionsRenderer,
} from "@react-google-maps/api";
import {
    Plus,
    Trash2,
    MapPin,
    Loader2,
    AlertCircle,
    CheckCircle,
    Navigation,
    Route,
    ChevronDown,
    ChevronUp,
    Milestone,
} from "lucide-react";
import { RouteManagementHeader } from "@/components/route-management/route-header";
import {
    getRoutes,
    createRoute,
    deleteRoute,
    createStop,
    getStops,
    deleteStop,
    Route as RouteType,
    Stop as StopType,
    LatLng,
} from "@/services/api";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria
// Must be a stable reference outside the component to prevent useJsApiLoader re-init
const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

type MarkerMode = "start" | "end" | "stop" | null;

interface Toast {
    type: "success" | "error";
    message: string;
}

export default function RouteManagementPage() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        libraries: LIBRARIES,
    });

    // ─── State ─────────────────────────────────────────────────────────────
    const [routes, setRoutes] = useState<RouteType[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(true);

    const [routeName, setRouteName] = useState("");
    const [routeDescription, setRouteDescription] = useState("");
    const [startLocation, setStartLocation] = useState<LatLng | null>(null);
    const [endLocation, setEndLocation] = useState<LatLng | null>(null);
    const [markerMode, setMarkerMode] = useState<MarkerMode>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

    // ─── Stop state ────────────────────────────────────────────────────────
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [stopName, setStopName] = useState("");
    const [stopLocation, setStopLocation] = useState<LatLng | null>(null);
    const [addingStop, setAddingStop] = useState(false);
    const [routeStops, setRouteStops] = useState<Record<string, StopType[]>>({});
    const [deletingStopId, setDeletingStopId] = useState<string | null>(null);

    // ─── Helpers ───────────────────────────────────────────────────────────
    const showToast = (type: Toast["type"], message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // ─── Load routes ───────────────────────────────────────────────────────
    const normalizeRoute = (r: RouteType): RouteType => ({
        ...r,
        _id: r._id || (r as any).id, // Handle both _id (frontend) and id (backend response)
        startLat: r.startLat ?? r.startLocation?.lat ?? 0,
        startLng: r.startLng ?? r.startLocation?.lng ?? 0,
        endLat: r.endLat ?? r.endLocation?.lat ?? 0,
        endLng: r.endLng ?? r.endLocation?.lng ?? 0,
    });

    const fetchRoutes = useCallback(async () => {
        try {
            const { data } = await getRoutes();
            // Backend may return an array directly or wrap it: { routes: [] } / { data: [] }
            const list = Array.isArray(data)
                ? data
                : Array.isArray((data as { routes?: unknown }).routes)
                    ? (data as { routes: RouteType[] }).routes
                    : Array.isArray((data as { data?: unknown }).data)
                        ? (data as { data: RouteType[] }).data
                        : [];
            setRoutes(list.map(normalizeRoute));
        } catch {
            showToast("error", "Failed to load routes.");
        } finally {
            setLoadingRoutes(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    // ─── Directions ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoaded || !startLocation || !endLocation) {
            setDirections(null);
            return;
        }
        const service = new google.maps.DirectionsService();
        service.route(
            {
                origin: startLocation,
                destination: endLocation,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK" && result) setDirections(result);
                else setDirections(null);
            }
        );
    }, [isLoaded, startLocation, endLocation]);

    // ─── Map click ─────────────────────────────────────────────────────────
    const onMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (!markerMode || !e.latLng) return;
            const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            if (markerMode === "start") {
                setStartLocation(pos);
                setMarkerMode("end"); // auto-advance to picking end
            } else if (markerMode === "end") {
                setEndLocation(pos);
                setMarkerMode(null);
            } else if (markerMode === "stop") {
                setStopLocation(pos);
                setMarkerMode(null);
            }
        },
        [markerMode]
    );

    // ─── Create route ──────────────────────────────────────────────────────
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!routeName.trim() || !startLocation || !endLocation) {
            showToast("error", "Please provide a name and select both start and end locations on the map.");
            return;
        }
        setCreating(true);
        const payload = {
            name: routeName.trim(),
            description: routeDescription.trim() || undefined,
            startLat: startLocation.lat,
            startLng: startLocation.lng,
            endLat: endLocation.lat,
            endLng: endLocation.lng,
        };
        console.log("📤 createRoute payload:", payload);
        try {
            const { data: raw } = await createRoute(payload);
            // Normalize: backend may return the route directly or wrapped
            const rawRoute: RouteType =
                raw && typeof raw === "object" && "_id" in raw
                    ? (raw as RouteType)
                    : (raw as { route: RouteType }).route ??
                    (raw as { data: RouteType }).data;
            const created = normalizeRoute(rawRoute);
            setRoutes((prev) => [created, ...prev]);
            setRouteName("");
            setRouteDescription("");
            setStartLocation(null);
            setEndLocation(null);
            setDirections(null);
            showToast("success", `Route "${created.name}" created successfully.`);
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: unknown } })?.response?.data;
            console.error("❌ createRoute error response:", errData);
            const msg =
                (errData as { message?: string })?.message ??
                JSON.stringify(errData) ??
                (err as Error)?.message ??
                "Failed to create route.";
            showToast("error", msg);
        } finally {
            setCreating(false);
        }
    };

    // ─── Delete route ──────────────────────────────────────────────────────
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete route "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await deleteRoute(id);
            setRoutes((prev) => prev.filter((r) => r._id !== id));
            showToast("success", `Route "${name}" deleted.`);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ??
                (err as Error)?.message ??
                "Failed to delete route.";
            showToast("error", msg);
            console.error("deleteRoute error:", err);
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Add stop ────────────────────────────────────────────────────────
    const handleAddStop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRouteId || !stopName.trim() || !stopLocation) {
            showToast("error", "Enter a stop name and click the map to place it.");
            return;
        }
        setAddingStop(true);
        try {
            const currentStops = routeStops[selectedRouteId] ?? [];
            const { data } = await createStop(selectedRouteId, {
                name: stopName.trim(),
                latitude: stopLocation.lat,
                longitude: stopLocation.lng,
                sequenceOrder: currentStops.length + 1,
            });
            const stop = data.stop;
            setRouteStops((prev) => ({
                ...prev,
                [selectedRouteId]: [...(prev[selectedRouteId] ?? []), stop],
            }));
            setStopName("");
            setStopLocation(null);
            showToast("success", `Stop “${stop.name}” added.`);
        } catch (err: unknown) {
            const errData = (err as { response?: { data?: unknown } })?.response?.data;
            const msg =
                (errData as { message?: string })?.message ??
                JSON.stringify(errData) ??
                (err as Error)?.message ??
                "Failed to add stop.";
            showToast("error", msg);
        } finally {
            setAddingStop(false);
        }
    };

    // ─── Load stops for selected route ─────────────────────────────────────
    const loadStopsForRoute = useCallback(async (routeId: string) => {
        try {
            const { data } = await getStops(routeId);
            setRouteStops((prev) => ({
                ...prev,
                [routeId]: data.stops ?? [],
            }));
        } catch (err: unknown) {
            console.error("Failed to load stops:", err);
        }
    }, []);

    // ─── Delete stop ─────────────────────────────────────────────────────
    const handleDeleteStop = async (stopId: string, stopName: string) => {
        if (!confirm(`Delete stop "${stopName}"?`)) return;
        setDeletingStopId(stopId);
        try {
            await deleteStop(stopId);
            setRouteStops((prev) => {
                const updated = { ...prev };
                if (selectedRouteId && updated[selectedRouteId]) {
                    updated[selectedRouteId] = updated[selectedRouteId].filter((s) => s.id !== stopId);
                }
                return updated;
            });
            showToast("success", `Stop "${stopName}" deleted.`);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (err as Error)?.message ??
                "Failed to delete stop.";
            showToast("error", msg);
        } finally {
            setDeletingStopId(null);
        }
    };

    const mapCursor = markerMode ? "crosshair" : "grab";

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <RouteManagementHeader />

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
                    ${toast.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                >
                    {toast.type === "success"
                        ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {toast.message}
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* ── Left panel ── */}
                <div className="w-full lg:w-96 xl:w-105 flex flex-col border-r border-gray-100 overflow-y-auto bg-white shrink-0">
                    {/* Create form */}
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Route className="w-4 h-4 text-blue-600" />
                            Create New Route
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                type="text"
                                required
                                placeholder="Route name (e.g. Route 42)"
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Description (optional)"
                                value={routeDescription}
                                onChange={(e) => setRouteDescription(e.target.value)}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMarkerMode("start")}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                                    ${markerMode === "start"
                                            ? "bg-green-600 border-green-600 text-white"
                                            : startLocation
                                                ? "bg-green-50 border-green-300 text-green-700"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    {startLocation ? "Start ✓" : markerMode === "start" ? "Click map…" : "Set Start"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMarkerMode("end")}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                                    ${markerMode === "end"
                                            ? "bg-red-600 border-red-600 text-white"
                                            : endLocation
                                                ? "bg-red-50 border-red-300 text-red-700"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    {endLocation ? "End ✓" : markerMode === "end" ? "Click map…" : "Set End"}
                                </button>
                            </div>

                            {(startLocation || endLocation) && (
                                <div className="text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
                                    {startLocation && <p>🟢 Start: {startLocation.lat.toFixed(5)}, {startLocation.lng.toFixed(5)}</p>}
                                    {endLocation && <p>🔴 End: {endLocation.lat.toFixed(5)}, {endLocation.lng.toFixed(5)}</p>}
                                </div>
                            )}

                            {(startLocation || endLocation) && (
                                <button
                                    type="button"
                                    onClick={() => { setStartLocation(null); setEndLocation(null); setMarkerMode(null); setDirections(null); }}
                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Clear markers
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                            >
                                {creating
                                    ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
                                    : <><Plus className="w-4 h-4" />Create Route</>}
                            </button>
                        </form>
                    </div>

                    {/* Routes list */}
                    <div className="flex-1 p-5">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">
                            All Routes
                            <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{routes.length}</span>
                        </h2>

                        {loadingRoutes ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : routes.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Route className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No routes yet. Create one above.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {routes.map((route) => (
                                    <div
                                        key={route._id}
                                        className={`rounded-xl border transition-all bg-white ${selectedRouteId === route._id
                                            ? "border-blue-300 shadow-sm"
                                            : "border-gray-100 hover:border-blue-200"
                                            }`}
                                    >
                                        {/* Route header row */}
                                        <div className="flex items-start justify-between p-3.5">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{route.name}</p>
                                                {route.description && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{route.description}</p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {route.startLat.toFixed(3)}, {route.startLng.toFixed(3)}
                                                    </span>
                                                    <span className="text-gray-300">→</span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                                                        <Navigation className="w-2.5 h-2.5" />
                                                        {route.endLat.toFixed(3)}, {route.endLng.toFixed(3)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* Manage stops toggle */}
                                                <button
                                                    onClick={() => {
                                                        const newSelected = selectedRouteId === route._id ? null : route._id;
                                                        setSelectedRouteId(newSelected);
                                                        setStopLocation(null);
                                                        setStopName("");
                                                        setMarkerMode(null);
                                                        if (newSelected && (!routeStops[newSelected] || routeStops[newSelected].length === 0)) {
                                                            loadStopsForRoute(newSelected);
                                                        }
                                                    }}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${selectedRouteId === route._id
                                                        ? "bg-blue-600 text-white"
                                                        : "text-blue-600 hover:bg-blue-50"
                                                        }`}
                                                    title="Manage stops"
                                                >
                                                    <Milestone className="w-3.5 h-3.5" />
                                                    <span>Stops</span>
                                                    {selectedRouteId === route._id
                                                        ? <ChevronUp className="w-3 h-3" />
                                                        : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(route._id, route.name)}
                                                    disabled={deletingId === route._id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete route"
                                                >
                                                    {deletingId === route._id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stops panel */}
                                        {selectedRouteId === route._id && (
                                            <div className="border-t border-gray-100 px-3.5 pb-4 pt-3 space-y-3">
                                                {/* Add stop form */}
                                                <form onSubmit={handleAddStop} className="space-y-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Add New Stop</p>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Stop name (e.g. Central Station)"
                                                        value={stopName}
                                                        onChange={(e) => setStopName(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setMarkerMode("stop")}
                                                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${markerMode === "stop"
                                                            ? "bg-blue-600 border-blue-600 text-white"
                                                            : stopLocation
                                                                ? "bg-blue-600 border-blue-600 text-white"
                                                                : "bg-white border-blue-200 text-blue-600 hover:bg-blue-100"
                                                            }`}
                                                    >
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {markerMode === "stop"
                                                            ? "Place on map…"
                                                            : stopLocation
                                                                ? `✓ Placed`
                                                                : "Click map"}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={addingStop || !stopLocation}
                                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-xs transition-colors"
                                                    >
                                                        {addingStop
                                                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Adding…</>
                                                            : <><Plus className="w-3.5 h-3.5" />Add Stop</>}
                                                    </button>
                                                </form>

                                                {/* Existing stops list */}
                                                {(routeStops[route._id] ?? []).length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Stops on Route ({routeStops[route._id].length})</p>
                                                        <div className="space-y-0 relative">
                                                            {routeStops[route._id]
                                                                .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                                                                .map((stop, idx, arr) => (
                                                                    <div key={stop.id} className="relative">
                                                                        {/* Timeline connector */}
                                                                        {idx < arr.length - 1 && (
                                                                            <div className="absolute left-4 top-8 w-0.5 h-8 bg-linear-to-b from-blue-300 to-blue-100" />
                                                                        )}
                                                                        {/* Stop item */}
                                                                        <div className="flex items-start gap-3 relative">
                                                                            {/* Stop number circle */}
                                                                            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 shadow-sm">
                                                                                {stop.sequenceOrder}
                                                                            </div>
                                                                            {/* Stop details */}
                                                                            <div className="min-w-0 flex-1 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                                                <p className="text-sm font-semibold text-gray-900 truncate">{stop.name}</p>
                                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                                    {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                                                                                </p>
                                                                                {stop.radiusMeters && (
                                                                                    <p className="text-xs text-gray-400 mt-0.5">Radius: {stop.radiusMeters}m</p>
                                                                                )}
                                                                            </div>
                                                                            {/* Delete stop button */}
                                                                            <button
                                                                                onClick={() => handleDeleteStop(stop.id, stop.name)}
                                                                                disabled={deletingStopId === stop.id}
                                                                                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all mt-0.5"
                                                                                title="Delete stop"
                                                                            >
                                                                                {deletingStopId === stop.id
                                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                                    : <Trash2 className="w-3.5 h-3.5" />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right panel: Map ── */}
                <div className="hidden lg:flex flex-1 flex-col bg-gray-100 relative overflow-hidden">
                    {markerMode && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 flex items-center gap-2 border border-gray-200">
                            <MapPin className={`w-4 h-4 ${markerMode === "start" ? "text-green-600"
                                : markerMode === "stop" ? "text-blue-600"
                                    : "text-red-500"
                                }`} />
                            {markerMode === "stop"
                                ? "Click map to place stop"
                                : `Click map to set ${markerMode === "start" ? "start" : "end"} location`}
                        </div>
                    )}

                    {loadError && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center text-gray-500 max-w-sm">
                                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                                <p className="font-semibold text-gray-800 mb-1">Map failed to load</p>
                                <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2 text-left wrap-break-word">
                                    {loadError.message || String(loadError)}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Make sure both <strong>Maps JavaScript API</strong> and <strong>Directions API</strong> are enabled in your{" "}
                                    <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noreferrer" className="text-blue-500 underline">Google Cloud Console</a>.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isLoaded && !loadError && (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    )}

                    {isLoaded && !loadError && (
                        <GoogleMap
                            mapContainerStyle={MAP_CONTAINER_STYLE}
                            center={DEFAULT_CENTER}
                            zoom={12}
                            onClick={onMapClick}
                            options={{
                                zoomControl: true,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: true,
                                draggableCursor: mapCursor,
                                styles: [
                                    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                                ],
                            }}
                        >
                            {startLocation && (
                                <MarkerF
                                    position={startLocation}
                                    label={{ text: "S", color: "white", fontWeight: "bold", fontSize: "12px" }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 12,
                                        fillColor: "#16a34a",
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                />
                            )}
                            {endLocation && (
                                <MarkerF
                                    position={endLocation}
                                    label={{ text: "E", color: "white", fontWeight: "bold", fontSize: "12px" }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 12,
                                        fillColor: "#dc2626",
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                />
                            )}
                            {directions && (
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: true,
                                        polylineOptions: {
                                            strokeColor: "#2563eb",
                                            strokeWeight: 5,
                                            strokeOpacity: 0.8,
                                        },
                                    }}
                                />
                            )}
                            {routes.map((r) => (
                                <MarkerF
                                    key={`${r._id}-s`}
                                    position={{ lat: r.startLat, lng: r.startLng }}
                                    title={`${r.name} — Start`}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 7,
                                        fillColor: "#16a34a",
                                        fillOpacity: 0.55,
                                        strokeColor: "#fff",
                                        strokeWeight: 1.5,
                                    }}
                                />
                            ))}
                            {routes.map((r) => (
                                <MarkerF
                                    key={`${r._id}-e`}
                                    position={{ lat: r.endLat, lng: r.endLng }}
                                    title={`${r.name} — End`}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 7,
                                        fillColor: "#dc2626",
                                        fillOpacity: 0.55,
                                        strokeColor: "#fff",
                                        strokeWeight: 1.5,
                                    }}
                                />
                            ))}
                            {/* Stop markers for selected route */}
                            {selectedRouteId && (routeStops[selectedRouteId] ?? []).map((stop) => (
                                <MarkerF
                                    key={stop.id}
                                    position={{ lat: stop.latitude, lng: stop.longitude }}
                                    title={stop.name}
                                    label={{ text: String(stop.sequenceOrder), color: "white", fontWeight: "bold", fontSize: "11px" }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 10,
                                        fillColor: "#2563eb",
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                />
                            ))}
                            {/* Pending stop location (before form submit) */}
                            {stopLocation && markerMode === null && selectedRouteId && (
                                <MarkerF
                                    position={stopLocation}
                                    title="New stop (unsaved)"
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 10,
                                        fillColor: "#7c3aed",
                                        fillOpacity: 0.85,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    )}
                </div>
            </div>
        </div>
    );
}
