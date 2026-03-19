import assert from "node:assert/strict"
import test from "node:test"

import {
    applyTelemetryToTrip,
    buildDriverUpdatePayload,
    buildStartTripPayload,
    buildStopTripPayload,
    getLatestActiveTripForDriver,
    hasActiveTripForDriver,
    resolveRouteUpdatePayload,
    validateStartTripContext,
} from "./mutation-utils"

test("assign driver payload uses memberId", () => {
    const payload = buildDriverUpdatePayload(" DRIVER-007 ")
    assert.deepEqual(payload, { memberId: "DRIVER-007" })
})

test("route update uses routeId when picker value is an id", () => {
    const payload = resolveRouteUpdatePayload("route-1", [
        { _id: "route-1", name: "Route 1", startLat: 0, startLng: 0, endLat: 0, endLng: 0 },
    ])

    assert.deepEqual(payload, { routeId: "route-1" })
})

test("route update uses routeName when picker value is a route name", () => {
    const payload = resolveRouteUpdatePayload("Route 42", [
        { _id: "route-1", name: "Route 1", startLat: 0, startLng: 0, endLat: 0, endLng: 0 },
    ])

    assert.deepEqual(payload, { routeName: "Route 42" })
})

test("active trip is latest non-completed and non-cancelled trip", () => {
    const trip = getLatestActiveTripForDriver([
        {
            id: "trip-1",
            driverId: "driver-1",
            busId: "bus-1",
            routeId: "route-1",
            status: "COMPLETED",
            createdAt: "2026-03-18T10:00:00.000Z",
        },
        {
            id: "trip-2",
            driverId: "driver-1",
            busId: "bus-1",
            routeId: "route-1",
            status: "RUNNING",
            createdAt: "2026-03-19T08:00:00.000Z",
        },
        {
            id: "trip-3",
            driverId: "driver-1",
            busId: "bus-1",
            routeId: "route-1",
            status: "STOPPED",
            createdAt: "2026-03-19T09:00:00.000Z",
        },
    ], "driver-1")

    assert.equal(trip?.id, "trip-3")
})

test("duplicate trip creation is blocked when active trip exists", () => {
    const hasActive = hasActiveTripForDriver([
        {
            id: "trip-1",
            driverId: "driver-1",
            busId: "bus-1",
            routeId: "route-1",
            status: "STARTED",
        },
    ], "driver-1")

    assert.equal(hasActive, true)
})

test("start trip validation requires assigned bus and assigned route", () => {
    const missingBus = validateStartTripContext({ assignedBusId: null, assignedRouteId: "route-1" })
    assert.equal(missingBus.ok, false)

    const missingRoute = validateStartTripContext({ assignedBusId: "bus-1", assignedRouteId: null })
    assert.equal(missingRoute.ok, false)

    const valid = validateStartTripContext({ assignedBusId: "bus-1", assignedRouteId: "route-1" })
    assert.equal(valid.ok, true)
})

test("start trip payload enforces STARTED status", () => {
    const payload = buildStartTripPayload({
        driverId: "driver-1",
        busId: "bus-1",
        routeId: "route-1",
        nowIso: "2026-03-19T12:00:00.000Z",
    })

    assert.deepEqual(payload, {
        driverId: "driver-1",
        busId: "bus-1",
        routeId: "route-1",
        status: "STARTED",
        startedAt: "2026-03-19T12:00:00.000Z",
    })
})

test("telemetry updates location and sets RUNNING when speed > 5", () => {
    const updated = applyTelemetryToTrip({
        driverId: "driver-1",
        busId: "bus-1",
        routeId: "route-1",
        status: "STARTED",
    }, {
        lat: 10.1,
        lng: 20.2,
        speed: 6,
    })

    assert.equal(updated.status, "RUNNING")
    assert.deepEqual(updated.currentLocation, { lat: 10.1, lng: 20.2 })
})

test("telemetry sets STOPPED when speed <= 5", () => {
    const updated = applyTelemetryToTrip({
        driverId: "driver-1",
        busId: "bus-1",
        routeId: "route-1",
        status: "RUNNING",
    }, {
        lat: 10.1,
        lng: 20.2,
        speed: 5,
    })

    assert.equal(updated.status, "STOPPED")
})

test("stop trip payload enforces COMPLETED status", () => {
    const payload = buildStopTripPayload({
        tripId: "trip-1",
        nowIso: "2026-03-19T14:00:00.000Z",
    })

    assert.deepEqual(payload, {
        tripId: "trip-1",
        driverId: undefined,
        status: "COMPLETED",
        endedAt: "2026-03-19T14:00:00.000Z",
    })
})
