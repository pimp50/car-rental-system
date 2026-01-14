import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"

import { getLeases } from "@/api/leases"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
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
import { useDataTable } from "@/hooks/useDataTable"

function getLeasesQueryOptions({
  plate_number,
  renter_name,
  status,
  skip,
  limit,
}: {
  plate_number?: string
  renter_name?: string
  status?: string
  skip?: number
  limit?: number
} = {}) {
  return {
    queryFn: () => getLeases(skip, limit, plate_number, renter_name, status),
    queryKey: ["leases", { plate_number, renter_name, status, skip, limit }],
  }
}

export const Route = createFileRoute("/_layout/leases/")({
  component: Leases,
  head: () => ({ meta: [{ title: "Plate Rentals - Inspiration" }] }),
})

function Leases() {
  const [plateNumber, setPlateNumber] = useState("")
  const [renterName, setRenterName] = useState("")
  const [status, setStatus] = useState("all")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const navigate = useNavigate()

  const { data: leases, isPending } = useQuery(
    getLeasesQueryOptions({
      plate_number: plateNumber || undefined,
      renter_name: renterName || undefined,
      status: status === "all" ? undefined : status,
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    }),
  )

  const table = useDataTable({
    data: leases?.data ?? [],
    columns: leaseColumns,
    pageCount: leases ? Math.ceil(leases.count / pagination.pageSize) : 0,
    id: "leases-table",
    pagination,
    onPaginationChange: setPagination,
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plate Rentals</h1>
            <p className="text-muted-foreground">
              Create and manage plate rentals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddLease />
          </div>
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

        <div className="p-4">Loading leases...</div>
      </div>
    )
  }

  if (
    leases &&
    leases.data.length === 0 &&
    !plateNumber &&
    !renterName &&
    (!status || status === "all")
  ) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Plate Rentals</h1>
            <p className="text-muted-foreground">
                Create and manage plate rentals
            </p>
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                <AddLease />
            </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">You don't have any leases yet</h3>
            <p className="text-muted-foreground">Add a new lease to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plate Rentals</h1>
          <p className="text-muted-foreground">
            Create and manage plate rentals
          </p>
        </div>
        <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddLease />
        </div>
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

      <DataTable
        table={table}
        onRowClick={(row) => navigate({ to: "/leases/$leaseId", params: { leaseId: row.id } })}
      />
    </div>
  )
}
