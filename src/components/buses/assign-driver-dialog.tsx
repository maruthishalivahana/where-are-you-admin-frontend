"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Driver } from "@/services/api"

interface AssignDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (memberId: string) => void
  drivers: Driver[]
  selectedBus?: { numberPlate?: string } | null
}

export function AssignDriverDialog({
  open,
  onOpenChange,
  onSubmit,
  drivers,
  selectedBus,
}: AssignDriverDialogProps) {
  const [memberId, setMemberId] = useState("")
  const [error, setError] = useState("")

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMemberId("")
      setError("")
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = () => {
    const value = memberId.trim()

    if (!value) {
      setError("Please select a driver")
      return
    }

    setError("")
    onSubmit(value)
    setMemberId("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            {selectedBus ? `Assign driver for ${selectedBus.numberPlate}` : "Assign driver to bus"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="driver-select" className="text-sm font-medium text-gray-700">
              Select Driver *
            </label>
            <select
              id="driver-select"
              value={memberId}
              onChange={(event) => {
                setMemberId(event.target.value)
                if (error) setError("")
              }}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a driver --</option>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <option key={driver.memberId || driver._id || driver.id} value={driver.memberId || ""}>
                    {driver.name} {driver.memberId ? `(${driver.memberId})` : ""}
                  </option>
                ))
              ) : (
                <option disabled>No drivers available</option>
              )}
            </select>
            {error ? <p className="text-destructive text-xs">{error}</p> : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
            disabled={drivers.length === 0}
          >
            Assign Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
