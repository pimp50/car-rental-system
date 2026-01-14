
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"

import { getRentals } from "@/api/rentals"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
import AddRental from "@/components/Rentals/AddRental"
import { rentalColumns } from "@/components/Rentals/columns"
import { useDataTable } from "@/hooks/useDataTable"

function getRentalsQueryOptions({
  skip,
  limit,
}: {
  skip?: number
  limit?: number
} = {}) {
  return {
    queryFn: () => getRentals(skip, limit),
    queryKey: ["rentals", { skip, limit }],
  }
}

export const Route = createFileRoute("/_layout/rentals/")({
  component: Rentals,
  head: () => ({ meta: [{ title: "Rentals - Car Rental System" }] }),
})

function Rentals() {
  const { data: rentals, isPending } = useQuery(getRentalsQueryOptions())

  const table = useDataTable({
    data: rentals?.data ?? [],
    columns: rentalColumns,
    pageCount: rentals?.count,
    id: "rentals-table",
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rentals</h1>
            <p className="text-muted-foreground">
              Manage car rentals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddRental />
          </div>
        </div>
        <div className="p-4">Loading rentals...</div>
      </div>
    )
  }

  if (rentals && rentals.data.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rentals</h1>
            <p className="text-muted-foreground">
              Manage car rentals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddRental />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">You don't have any rentals yet</h3>
          <p className="text-muted-foreground">Add a new rental to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rentals</h1>
          <p className="text-muted-foreground">
            Manage car rentals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <AddRental />
        </div>
      </div>

      <DataTable table={table} />
    </div>
  )
}
