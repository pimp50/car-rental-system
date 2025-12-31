import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState } from "react"

import { getPlates } from "@/api/plates"
import { DataTable } from "@/components/Common/DataTable"
import AddPlate from "@/components/Plates/AddPlate"
import { plateColumns } from "@/components/Plates/columns"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getPlatesQueryOptions({
  plate_number,
  status,
}: {
  plate_number?: string
  status?: string
} = {}) {
  return {
    queryFn: () => getPlates(0, 100, plate_number, status),
    queryKey: ["plates", { plate_number, status }],
  }
}

export const Route = createFileRoute("/_layout/plates")({
  component: Plates,
  head: () => ({ meta: [{ title: "Plates - Inspiration" }] }),
})

interface PlatesTableContentProps {
  plateNumber: string
  status: string
}

function PlatesTableContent({ plateNumber, status }: PlatesTableContentProps) {
  const { data: plates } = useSuspenseQuery(
    getPlatesQueryOptions({
      plate_number: plateNumber || undefined,
      status: status === "all" ? undefined : status,
    }),
  )

  if (
    plates.data.length === 0 &&
    !plateNumber &&
    (!status || status === "all")
  ) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any plates yet</h3>
        <p className="text-muted-foreground">Add a new plate to get started</p>
      </div>
    )
  }

  return (
    <DataTable columns={plateColumns} data={plates.data} id="plates-table" />
  )
}

function Plates() {
  const [plateNumber, setPlateNumber] = useState("")
  const [status, setStatus] = useState("all")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plates</h1>
          <p className="text-muted-foreground">
            Create and manage license plates
          </p>
        </div>
        <AddPlate />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by plate number..."
            className="pl-8"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Rented">Rented</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<div className="p-4">Loading plates...</div>}>
        <PlatesTableContent plateNumber={plateNumber} status={status} />
      </Suspense>
    </div>
  )
}
