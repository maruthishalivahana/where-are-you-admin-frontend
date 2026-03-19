import assert from "node:assert/strict"
import test from "node:test"

import { BUS_TABLE_COLUMNS } from "./bus-table"

test("bus list renders column set without fleet status", () => {
    assert.equal(BUS_TABLE_COLUMNS.includes("Fleet Status" as (typeof BUS_TABLE_COLUMNS)[number]), false)
    assert.deepEqual(BUS_TABLE_COLUMNS, [
        "Bus Plate",
        "Route",
        "Driver",
        "Trip Status",
        "Actions",
    ])
})
