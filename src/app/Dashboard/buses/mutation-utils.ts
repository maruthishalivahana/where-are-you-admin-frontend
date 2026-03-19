import type { BusResponse, Route, UpdateBusRoutePayload } from "@/services/api"

export type TripStatus =
    | "PENDING"
    | "STARTED"
    | "RUNNING"
    | "STOPPED"
    | "COMPLETED"
    | "CANCELLED"

export interface TripRuntimeShape {
    id?: string
    driverId: string
    busId: string
    routeId: string
    status: TripStatus
    createdAt?: string
    startedAt?: string
    endedAt?: string
    currentLocation?: {
        lat: number
        lng: number
    }
}

export interface BusIdentity {
    _id?: string
    id?: string
    numberPlate: string
}

interface RouteLike {
    _id?: string
    id?: string
    name?: string
}

export const resolveBusKey = (bus: BusIdentity) => String(bus._id || bus.id || bus.numberPlate)

export const hasExpectedBusFields = <T extends object>(
    bus: T | null | undefined,
    requiredFields: Array<keyof T>
) => {
    if (!bus) {
        return false
    }

    return requiredFields.every((field) => {
        const value = bus[field]
        return value !== undefined && value !== null
    })
}

export const hasCompleteMutationBus = (
    bus: Partial<BusResponse> | null | undefined,
    requiredFields: Array<keyof BusResponse>
) => {
    return hasExpectedBusFields(bus, ["numberPlate", ...requiredFields])
}

export const buildDriverUpdatePayload = (memberId: string) => ({
    memberId: memberId.trim(),
})

export const buildStartTripPayload = (input: {
    driverId: string
    busId: string
    routeId: string
    nowIso?: string
}) => {
    const now = input.nowIso ?? new Date().toISOString()

    return {
        driverId: input.driverId,
        busId: input.busId,
        routeId: input.routeId,
        status: "STARTED" as const,
        startedAt: now,
    }
}

export const buildStopTripPayload = (input: {
    tripId?: string
    driverId?: string
    nowIso?: string
}) => {
    const now = input.nowIso ?? new Date().toISOString()

    return {
        tripId: input.tripId,
        driverId: input.driverId,
        status: "COMPLETED" as const,
        endedAt: now,
    }
}

export const validateStartTripContext = (input: {
    assignedBusId?: string | null
    assignedRouteId?: string | null
}) => {
    if (!input.assignedBusId) {
        return {
            ok: false,
            message: "Cannot start trip: driver has no assignedBusId.",
        }
    }

    if (!input.assignedRouteId) {
        return {
            ok: false,
            message: "Cannot start trip: assigned bus has no routeId.",
        }
    }

    return { ok: true as const }
}

export const getLatestActiveTripForDriver = (
    trips: TripRuntimeShape[],
    driverId: string
) => {
    const active = trips
        .filter((trip) => trip.driverId === driverId)
        .filter((trip) => trip.status !== "COMPLETED" && trip.status !== "CANCELLED")
        .sort((left, right) => {
            const leftTime = Date.parse(left.createdAt ?? "")
            const rightTime = Date.parse(right.createdAt ?? "")

            if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0
            if (Number.isNaN(leftTime)) return 1
            if (Number.isNaN(rightTime)) return -1

            return rightTime - leftTime
        })

    return active[0]
}

export const hasActiveTripForDriver = (trips: TripRuntimeShape[], driverId: string) => {
    return Boolean(getLatestActiveTripForDriver(trips, driverId))
}

export const applyTelemetryToTrip = (
    trip: TripRuntimeShape,
    telemetry: {
        lat: number
        lng: number
        speed: number
    }
): TripRuntimeShape => {
    return {
        ...trip,
        currentLocation: {
            lat: telemetry.lat,
            lng: telemetry.lng,
        },
        status: telemetry.speed > 5 ? "RUNNING" : "STOPPED",
    }
}

export const getErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === "object" && "response" in err) {
        const maybe = err as { response?: { data?: { message?: unknown } } }
        const message = maybe.response?.data?.message

        if (typeof message === "string" && message.trim()) {
            return message
        }
    }

    return fallback
}

export const resolveRouteUpdatePayload = (
    selectedRouteValue: string,
    routes: Route[]
): UpdateBusRoutePayload => {
    const value = selectedRouteValue.trim()
    if (!value) {
        return { routeName: "" }
    }

    const typedRoutes = routes as Array<Route & RouteLike>
    const hasMatchingId = typedRoutes.some((route) => route._id === value || route.id === value)
    if (hasMatchingId) {
        return { routeId: value }
    }

    return { routeName: value }
}
