type LocationResult = {
    displayName: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    address?: string;
};

const autocompleteCache = new Map<string, google.maps.places.AutocompletePrediction[]>();
const detailsCache = new Map<string, LocationResult>();
const inflightAutocomplete = new Map<string, Promise<google.maps.places.AutocompletePrediction[]>>();
const inflightDetails = new Map<string, Promise<LocationResult>>();

function getApiKey() {
    return typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined;
}

export async function autocompletePlaces(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    const q = input.trim();
    if (!q) return [];
    if (autocompleteCache.has(q)) return autocompleteCache.get(q)!;
    if (inflightAutocomplete.has(q)) return inflightAutocomplete.get(q)!;

    const p = (async () => {
        try {
            // Prefer client-side Places API if available
            if (typeof window !== "undefined" && (window as any).google?.maps?.places?.AutocompleteService) {
                const svc = new (window as any).google.maps.places.AutocompleteService();
                return await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
                    svc.getPlacePredictions({ input: q, componentRestrictions: undefined }, (preds: any[], status: any) => {
                        if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK) {
                            resolve([]);
                        } else {
                            resolve(preds || []);
                        }
                    });
                });
            }

            const key = getApiKey();
            if (!key) return [];
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&key=${key}&types=geocode&language=en`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            if (body.status !== "OK") return [];
            return body.predictions || [];
        } finally {
            inflightAutocomplete.delete(q);
        }
    })();

    inflightAutocomplete.set(q, p);
    const preds = await p;
    autocompleteCache.set(q, preds);
    return preds;
}

export async function getPlaceDetails(placeId: string): Promise<LocationResult> {
    if (detailsCache.has(placeId)) return detailsCache.get(placeId)!;
    if (inflightDetails.has(placeId)) return inflightDetails.get(placeId)!;

    const p = (async () => {
        try {
            if (typeof window !== "undefined" && (window as any).google?.maps?.places?.PlacesService) {
                const mapDiv = document.createElement("div");
                const ps = new (window as any).google.maps.places.PlacesService(mapDiv);
                return await new Promise<LocationResult>((resolve, reject) => {
                    ps.getDetails({ placeId, fields: ["geometry", "formatted_address", "name", "place_id"] }, (place: any, status: any) => {
                        if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK) {
                            reject(new Error("Place details failed"));
                            return;
                        }
                        const lat = place.geometry?.location?.lat?.();
                        const lng = place.geometry?.location?.lng?.();
                        const res: LocationResult = {
                            displayName: place.name || place.formatted_address || "",
                            address: place.formatted_address,
                            latitude: lat,
                            longitude: lng,
                            placeId: place.place_id,
                        };
                        resolve(res);
                    });
                });
            }

            const key = getApiKey();
            if (!key) throw new Error("Missing Google Maps API key");
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${key}&fields=geometry,formatted_address,name,place_id`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            if (body.status !== "OK") throw new Error(body.error_message || "Place details failed");
            const place = body.result;
            const lat = place.geometry.location.lat;
            const lng = place.geometry.location.lng;
            const result: LocationResult = {
                displayName: place.name || place.formatted_address || "",
                address: place.formatted_address,
                latitude: lat,
                longitude: lng,
                placeId: place.place_id,
            };
            detailsCache.set(placeId, result);
            return result;
        } finally {
            inflightDetails.delete(placeId);
        }
    })();

    inflightDetails.set(placeId, p);
    return p;
}

export function clearLocationCache() {
    autocompleteCache.clear();
    detailsCache.clear();
}

export type { LocationResult };
