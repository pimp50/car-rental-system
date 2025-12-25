import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState } from "react"

import { getLeases } from "@/api/leases"
import { DataTable } from "@/components/Common/DataTable"
import AddLease from "@/components/Leases/AddLease"
import { leaseColumns } from "@/components/Leases/columns"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getLeasesQueryOptions({
  plate_number,
  renter_name,
  status,
}: {
  plate_number?: string
  renter_name?: string
  status?: string
} = {}) {
  return {
    queryFn: () => getLeases(0, 100, plate_number, renter_name, status),
    queryKey: ["leases", { plate_number, renter_name, status }],
  }
}

export const Route = createFileRoute("/_layout/leases")({
  component: Leases,
  head: () => ({ meta: [{ title: "Leases - FastAPI Cloud" }] }),
})

interface LeasesTableContentProps {
  plateNumber: string
  renterName: string
  status: string
}

function LeasesTableContent({
  plateNumber,
  renterName,
  status,
}: LeasesTableContentProps) {
  const { data: leases } = useSuspenseQuery(
    getLeasesQueryOptions({
      plate_number: plateNumber || undefined,
      renter_name: renterName || undefined,
      status: status === "all" ? undefined : status,
    }),
  )

  if (
    leases.data.length === 0 &&
    !plateNumber &&
    !renterName &&
    (!status || status === "all")
  ) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any leases yet</h3>
        <p className="text-muted-foreground">Add a new lease to get started</p>
      </div>
    )
  }
  return <DataTable columns={leaseColumns} data={leases.data} id="leases-table" />
}

function Leases() {
  const [plateNumber, setPlateNumber] = useState("")
  const [renterName, setRenterName] = useState("")
  const [status, setStatus] = useState("all")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leases</h1>
          <p className="text-muted-foreground">
            Create and manage plate leases
          </p>
        </div>
        <AddLease />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by plate number..."
            className="pl-8"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </div>
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by renter name..."
            className="pl-8"
            value={renterName}
            onChange={(e) => setRenterName(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<div className="p-4">Loading leases...</div>}>
        <LeasesTableContent
          plateNumber={plateNumber}
          renterName={renterName}
          status={status}
        />
      </Suspense>
    </div>
  )
}
