"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getTripStatusMeta } from "@/lib/bus-status"

type ViewBus = {
    numberPlate: string
    routeName?: string
    routeId?: string
    driverId?: string
    tripStatus?: string | null
    currentLat?: number
    currentLng?: number
    speed?: number
    createdAt?: string
    updatedAt?: string
}

interface ViewBusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bus?: ViewBus
}

export function ViewBusDialog({
    open,
    onOpenChange,
    bus,
}: ViewBusDialogProps) {
    if (!bus) return null

    const tripMeta = getTripStatusMeta(bus.tripStatus)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle>Bus Details</DialogTitle>
                    <DialogDescription>
                        {bus.numberPlate}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Number Plate
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{bus.numberPlate}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Trip Status
                            </p>
                            <Badge className={`${tripMeta.badgeClassName} border-0 w-fit`}>
                                {tripMeta.label}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Route
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {bus.routeName || bus.routeId || "Unassigned"}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Driver ID
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {bus.driverId || "Unassigned"}
                            </p>
                        </div>

                        {typeof bus.currentLat === "number" && typeof bus.currentLng === "number" && (
                            <div className="col-span-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Current Location
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {bus.currentLat.toFixed(4)}, {bus.currentLng.toFixed(4)}
                                </p>
                            </div>
                        )}

                        {typeof bus.speed === "number" && (
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Speed
                                </p>
                                <p className="text-sm text-gray-700">
                                    {bus.speed.toFixed(1)} km/h
                                </p>
                            </div>
                        )}

                        {bus.createdAt && (
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Created
                                </p>
                                <p className="text-sm text-gray-600">
                                    {new Date(bus.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}

                        {bus.updatedAt && (
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Updated
                                </p>
                                <p className="text-sm text-gray-600">
                                    {new Date(bus.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
