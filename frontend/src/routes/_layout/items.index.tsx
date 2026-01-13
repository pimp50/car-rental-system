import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"

import { ItemsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
import AddItem from "@/components/Items/AddItem"
import { columns } from "@/components/Items/columns"
import PendingItems from "@/components/Pending/PendingItems"
import { useDataTable } from "@/hooks/useDataTable"

function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 100 }),
    queryKey: ["items"],
  }
}

export const Route = createFileRoute("/_layout/items/")({
  component: Items,
  head: () => ({
    meta: [
      {
        title: "Items - Inspiration",
      },
    ],
  }),
})

function Items() {
  const { data: items, isPending } = useQuery(getItemsQueryOptions())
  const navigate = useNavigate()

  const table = useDataTable({
    data: items?.data ?? [],
    columns: columns,
    pageCount: items?.count,
    id: "items-table"
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Items</h1>
            <p className="text-muted-foreground">Create and manage your items</p>
          </div>
          <div className="flex items-center gap-2">
             <DataTableViewOptions table={table} />
             <AddItem />
          </div>
        </div>
        <PendingItems />
      </div>
    )
  }

  if (items && items.data.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Items</h1>
            <p className="text-muted-foreground">Create and manage your items</p>
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                <AddItem />
            </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">You don't have any items yet</h3>
            <p className="text-muted-foreground">Add a new item to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">Create and manage your items</p>
        </div>
        <div className="flex items-center gap-2">
           <DataTableViewOptions table={table} />
           <AddItem />
        </div>
      </div>
      <DataTable
        table={table}
        onRowClick={(row) => navigate({ to: "/items/$itemId", params: { itemId: row.id } })}
      />
    </div>
  )
}
