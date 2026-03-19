export type TripStatus =
    | "PENDING"
    | "STARTED"
    | "RUNNING"
    | "STOPPED"
    | "COMPLETED"
    | "CANCELLED"

export type TripStatusValue = TripStatus | "UNKNOWN"

export interface StatusMeta {
    label: string
    badgeClassName: string
    sortOrder: number
}

const TRIP_STATUS_META: Record<TripStatusValue, StatusMeta> = {
    PENDING: {
        label: "Start Trip",
        badgeClassName: "bg-slate-100 text-slate-800",
        sortOrder: 1,
    },
    STARTED: {
        label: "Trip Started",
        badgeClassName: "bg-blue-100 text-blue-800",
        sortOrder: 2,
    },
    RUNNING: {
        label: "Bus Moving",
        badgeClassName: "bg-green-100 text-green-800",
        sortOrder: 3,
    },
    STOPPED: {
        label: "Bus Stopped",
        badgeClassName: "bg-amber-100 text-amber-800",
        sortOrder: 4,
    },
    COMPLETED: {
        label: "Trip Completed",
        badgeClassName: "bg-indigo-100 text-indigo-800",
        sortOrder: 5,
    },
    CANCELLED: {
        label: "Trip Cancelled",
        badgeClassName: "bg-red-100 text-red-800",
        sortOrder: 6,
    },
    UNKNOWN: {
        label: "Unknown",
        badgeClassName: "bg-gray-100 text-gray-700",
        sortOrder: 99,
    },
}

const toUpperSnake = (value: string) => value.trim().toUpperCase().replace(/[\s-]+/g, "_")

export const parseTripStatus = (value?: string | null): TripStatus | undefined => {
    if (!value) return undefined

    const normalized = toUpperSnake(value)

    if (normalized === "PENDING") return "PENDING"
    if (normalized === "STARTED") return "STARTED"
    if (normalized === "RUNNING") return "RUNNING"
    if (normalized === "STOPPED") return "STOPPED"
    if (normalized === "COMPLETED") return "COMPLETED"
    if (normalized === "CANCELLED") return "CANCELLED"

    return undefined
}

export const toTripStatusValue = (value?: string | null): TripStatusValue => {
    return parseTripStatus(value) ?? "UNKNOWN"
}

export const getTripStatusMeta = (value: string | null | undefined): StatusMeta => {
    const resolved = toTripStatusValue(value)
    return TRIP_STATUS_META[resolved]
}

export const matchesTripStatusFilter = (
    value: string | null | undefined,
    filter: string,
    allFilterValue = "ALL"
) => {
    if (filter === allFilterValue) return true
    const resolved = parseTripStatus(value)
    return resolved === filter
}

export const getTripStatusSortOrder = (value: string | null | undefined) => {
    return getTripStatusMeta(value).sortOrder
}
