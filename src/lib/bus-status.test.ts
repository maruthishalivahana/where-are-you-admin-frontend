import assert from "node:assert/strict"
import test from "node:test"

import { getTripStatusMeta, parseTripStatus } from "./bus-status"

test("trip status enum parsing accepts exact architecture values", () => {
    assert.equal(parseTripStatus("PENDING"), "PENDING")
    assert.equal(parseTripStatus("STARTED"), "STARTED")
    assert.equal(parseTripStatus("RUNNING"), "RUNNING")
    assert.equal(parseTripStatus("STOPPED"), "STOPPED")
    assert.equal(parseTripStatus("COMPLETED"), "COMPLETED")
    assert.equal(parseTripStatus("CANCELLED"), "CANCELLED")
})

test("trip status UI mapping matches required labels", () => {
    assert.equal(getTripStatusMeta("PENDING").label, "Start Trip")
    assert.equal(getTripStatusMeta("STARTED").label, "Trip Started")
    assert.equal(getTripStatusMeta("RUNNING").label, "Bus Moving")
    assert.equal(getTripStatusMeta("STOPPED").label, "Bus Stopped")
    assert.equal(getTripStatusMeta("COMPLETED").label, "Trip Completed")
    assert.equal(getTripStatusMeta("CANCELLED").label, "Trip Cancelled")
})
