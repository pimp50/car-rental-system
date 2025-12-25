import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState } from "react"

import { getRenters } from "@/api/renters"
import { DataTable } from "@/components/Common/DataTable"
import AddRenter from "@/components/Renters/AddRenter"
import { renterColumns } from "@/components/Renters/columns"
import { Input } from "@/components/ui/input"

function getRentersQueryOptions({ search }: { search?: string } = {}) {
  return {
    queryFn: () => getRenters(0, 100, search),
    queryKey: ["renters", { search }],
  }
}

export const Route = createFileRoute("/_layout/renters")({
  component: Renters,
  head: () => ({ meta: [{ title: "Renters - FastAPI Cloud" }] }),
})

interface RentersTableContentProps {
  search: string
}

function RentersTableContent({ search }: RentersTableContentProps) {
  const { data: renters } = useSuspenseQuery(
    getRentersQueryOptions({ search: search || undefined }),
  )

  if (renters.data.length === 0 && !search) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          You don't have any renters yet
        </h3>
        <p className="text-muted-foreground">Add a new renter to get started</p>
      </div>
    )
  }
  return <DataTable columns={renterColumns} data={renters.data} id="renters-table" />
}

function Renters() {
  const [search, setSearch] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Renters</h1>
          <p className="text-muted-foreground">Create and manage renters</p>
        </div>
        <AddRenter />
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

      <Suspense fallback={<div className="p-4">Loading renters...</div>}>
        <RentersTableContent search={search} />
      </Suspense>
    </div>
  )
}
