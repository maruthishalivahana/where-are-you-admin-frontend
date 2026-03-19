"use client"

import { memo } from "react"
import {
    Eye,
    ListFilter,
    Loader2,
    MoreHorizontal,
    Trash2,
    UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getTripStatusMeta, type TripStatusValue } from "@/lib/bus-status"

export interface Bus {
    id?: string
    _id?: string
    numberPlate: string
    routeName?: string
    routeId?: string
    driverId?: string
    driverName?: string
    tripStatus?: TripStatusValue
    status?: "active" | "inactive"
    currentLat?: number
    currentLng?: number
    speed?: number
    createdAt?: string
}

interface BusTableProps {
    buses: Bus[]
    routes: string[]
    routeFilter: string
    searchQuery: string
    tripStatusFilter: string
    sortBy: string
    onSearchQueryChange: (value: string) => void
    onRouteFilterChange: (value: string) => void
    onTripStatusFilterChange: (value: string) => void
    onSortByChange: (value: string) => void
    onClearFilters: () => void
    onAssignDriver: (bus: Bus, index: number) => void
    onChangeRoute: (bus: Bus, index: number) => void
    isBusRowBusy: (bus: Bus) => boolean
    getBusRowActionLabel: (bus: Bus) => string | null
    onViewBus: (bus: Bus, index: number) => void
    onDeleteBus: (bus: Bus, index: number) => void
}

interface BusRowProps {
    bus: Bus
    idx: number
    onAssignDriver: (bus: Bus, index: number) => void
    onChangeRoute: (bus: Bus, index: number) => void
    isRowBusy: boolean
    rowActionLabel: string | null
    onViewBus: (bus: Bus, index: number) => void
    onDeleteBus: (bus: Bus, index: number) => void
}

const TRIP_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "ALL", label: "All Trip Status" },
    { value: "PENDING", label: "Start Trip" },
    { value: "STARTED", label: "Trip Started" },
    { value: "RUNNING", label: "Bus Moving" },
    { value: "STOPPED", label: "Bus Stopped" },
    { value: "COMPLETED", label: "Trip Completed" },
    { value: "CANCELLED", label: "Trip Cancelled" },
]

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "NUMBER_PLATE_ASC", label: "Plate A-Z" },
    { value: "NUMBER_PLATE_DESC", label: "Plate Z-A" },
    { value: "TRIP_STATUS", label: "Trip Status" },
]

export const BUS_TABLE_COLUMNS = [
    "Bus Plate",
    "Route",
    "Driver",
    "Trip Status",
    "Actions",
] as const

const resolveBusKey = (bus: Bus) => String(bus._id || bus.id || bus.numberPlate)

const BusRow = memo(function BusRow({
    bus,
    idx,
    onAssignDriver,
    onChangeRoute,
    isRowBusy,
    rowActionLabel,
    onViewBus,
    onDeleteBus,
}: BusRowProps) {
    const tripMeta = getTripStatusMeta(bus.tripStatus)

    return (
        <TableRow className="hover:bg-gray-50/70">
            <TableCell className="font-semibold text-gray-900">
                {bus.numberPlate}
            </TableCell>

            <TableCell>
                {bus.routeName ? (
                    <Badge variant="secondary" className="cursor-default border-gray-300 bg-white text-blue-600">
                        {bus.routeName}
                    </Badge>
                ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                )}
            </TableCell>

            <TableCell>
                {bus.driverName && bus.driverName !== "Unassigned" ? (
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                            {bus.driverName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{bus.driverName}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                )}
            </TableCell>

            <TableCell>
                <Badge className={`rounded-full border-0 ${tripMeta.badgeClassName}`}>
                    {tripMeta.label}
                </Badge>
            </TableCell>

            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    {isRowBusy && (
                        <span className="mr-1 inline-flex items-center gap-1 text-xs text-blue-600" role="status" aria-live="polite">
                            <Loader2 className="size-3 animate-spin" />
                            {rowActionLabel ?? "Updating"}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewBus(bus, idx)}
                        className="rounded-lg hover:bg-gray-100 h-8 w-8"
                        title="View Details"
                        disabled={isRowBusy}
                    >
                        <Eye className="size-4 text-gray-600" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onAssignDriver(bus, idx)}
                        className="rounded-lg hover:bg-gray-100 h-8 w-8"
                        title="Assign Driver"
                        disabled={isRowBusy}
                    >
                        <UserRound className="size-4 text-gray-600" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-lg hover:bg-gray-100 h-8 w-8"
                                disabled={isRowBusy}
                            >
                                <MoreHorizontal className="size-4 text-gray-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg">
                            <DropdownMenuItem onClick={() => onDeleteBus(bus, idx)} disabled={isRowBusy}>
                                <Trash2 className="size-4" />
                                Delete Bus
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={isRowBusy}
                                onClick={() => onChangeRoute(bus, idx)}
                                title="Change route"
                            >
                                <ListFilter className="size-4" />
                                Change Route
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    )
})

export function BusTable({
    buses,
    routes,
    routeFilter,
    searchQuery,
    tripStatusFilter,
    sortBy,
    onSearchQueryChange,
    onRouteFilterChange,
    onTripStatusFilterChange,
    onSortByChange,
    onClearFilters,
    onAssignDriver,
    onChangeRoute,
    isBusRowBusy,
    getBusRowActionLabel,
    onViewBus,
    onDeleteBus,
}: BusTableProps) {
    return (
        <Card className="rounded-xl border border-gray-200 shadow-sm">
            <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <Input
                            value={searchQuery}
                            onChange={(event) => onSearchQueryChange(event.target.value)}
                            placeholder="Search plate, route, or driver"
                            className="h-9 min-w-56"
                        />

                        <select
                            value={routeFilter}
                            onChange={(event) => onRouteFilterChange(event.target.value)}
                            className="h-9 min-w-32 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All Routes">All Routes</option>
                            {routes.map((route) => (
                                <option key={route} value={route}>
                                    {route}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tripStatusFilter}
                            onChange={(event) => onTripStatusFilterChange(event.target.value)}
                            className="h-9 min-w-36 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {TRIP_FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(event) => onSortByChange(event.target.value)}
                            className="h-9 min-w-32 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <Button
                            variant="ghost"
                            onClick={onClearFilters}
                            className="h-9 rounded-md px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Clear Filters
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon-sm" className="rounded-md border-gray-200 h-9 w-9">
                            <ListFilter className="size-4" />
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {BUS_TABLE_COLUMNS.map((label) => (
                                <TableHead
                                    key={label}
                                    className={label === "Actions"
                                        ? "text-right text-xs uppercase tracking-wide text-gray-500"
                                        : "text-xs uppercase tracking-wide text-gray-500"
                                    }
                                >
                                    {label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-gray-500">
                                    No buses available. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            buses.map((bus, idx) => {
                                const stableKey = resolveBusKey(bus)
                                return (
                                    <BusRow
                                        key={stableKey}
                                        bus={bus}
                                        idx={idx}
                                        onAssignDriver={onAssignDriver}
                                        onChangeRoute={onChangeRoute}
                                        isRowBusy={isBusRowBusy(bus)}
                                        rowActionLabel={getBusRowActionLabel(bus)}
                                        onViewBus={onViewBus}
                                        onDeleteBus={onDeleteBus}
                                    />
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {buses.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600">
                            Showing {buses.length} bus{buses.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
