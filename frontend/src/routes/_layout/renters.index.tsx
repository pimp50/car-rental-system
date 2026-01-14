import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"

import { getRenters } from "@/api/renters"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
import AddRenter from "@/components/Renters/AddRenter"
import { renterColumns } from "@/components/Renters/columns"
import { Input } from "@/components/ui/input"
import { useDataTable } from "@/hooks/useDataTable"

function getRentersQueryOptions({ search, skip, limit }: { search?: string, skip?: number, limit?: number } = {}) {
  return {
    queryFn: () => getRenters(skip, limit, search),
    queryKey: ["renters", { search, skip, limit }],
  }
}

export const Route = createFileRoute("/_layout/renters/")({
  component: Renters,
  head: () => ({ meta: [{ title: "Renters - Inspiration" }] }),
})

function Renters() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const navigate = useNavigate()

  const { data: renters, isPending } = useQuery(
    getRentersQueryOptions({ 
        search: search || undefined,
        skip: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
    }),
  )

  const table = useDataTable({
    data: renters?.data ?? [],
    columns: renterColumns,
    pageCount: renters ? Math.ceil(renters.count / pagination.pageSize) : 0,
    id: "renters-table",
    pagination,
    onPaginationChange: setPagination,
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Renters</h1>
            <p className="text-muted-foreground">Create and manage renters</p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddRenter />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, phone..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4">Loading renters...</div>
      </div>
    )
  }

  if (renters && renters.data.length === 0 && !search) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Renters</h1>
            <p className="text-muted-foreground">Create and manage renters</p>
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                <AddRenter />
            </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
            You don't have any renters yet
            </h3>
            <p className="text-muted-foreground">Add a new renter to get started</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Renters</h1>
          <p className="text-muted-foreground">Create and manage renters</p>
        </div>
        <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddRenter />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, phone..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        table={table}
        onRowClick={(row) => navigate({ to: "/renters/$renterId", params: { renterId: row.id } })}
      />
    </div>
  )
}
