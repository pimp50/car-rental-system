import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"

import { getCars } from "@/api/cars"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
import AddCar from "@/components/Cars/AddCar"
import { carColumns } from "@/components/Cars/columns"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataTable } from "@/hooks/useDataTable"

function getCarsQueryOptions({
  model,
  status,
  skip,
  limit,
}: {
  model?: string
  status?: string
  skip?: number
  limit?: number
} = {}) {
  return {
    queryFn: () => getCars(skip, limit, model, undefined, status),
    queryKey: ["cars", { model, status, skip, limit }],
  }
}

export const Route = createFileRoute("/_layout/cars/")({
  component: Cars,
})

function Cars() {
  const [model, setModel] = useState("")
  const [status, setStatus] = useState("all")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const navigate = useNavigate()

  const { data: cars, isPending } = useQuery(
    getCarsQueryOptions({
      model: model || undefined,
      status: status === "all" ? undefined : status,
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    }),
  )

  const table = useDataTable({
    data: cars?.data ?? [],
    columns: carColumns,
    pageCount: cars ? Math.ceil(cars.count / pagination.pageSize) : 0,
    id: "cars-table",
    initialVisibility: {
        id: false,
        installation_fee_for_safety_equipment: false,
        insurance_expenses: false,
        service_expenses: false,
        maintenance_costs: false,
        full_coverage_auto_insurance: false,
        other_expenses: false,
    },
    pagination,
    onPaginationChange: setPagination,
  })

  if (isPending) {
     return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cars</h1>
            <p className="text-muted-foreground">
              Create and manage cars
            </p>
          </div>
          <div className="flex items-center gap-2">
             <DataTableViewOptions table={table} />
             <AddCar />
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search by model..."
                className="pl-8"
                value={model}
                onChange={(e) => setModel(e.target.value)}
            />
            </div>
            <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">available</SelectItem>
                <SelectItem value="rented">rented</SelectItem>
                <SelectItem value="maintenance">maintenance</SelectItem>
            </SelectContent>
            </Select>
        </div>

        <div className="p-4">Loading cars...</div>
      </div>
    )
  }

  if (
    cars?.data.length === 0 &&
    !model &&
    (!status || status === "all")
  ) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cars</h1>
            <p className="text-muted-foreground">
              Create and manage cars
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddCar />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">You don't have any cars yet</h3>
          <p className="text-muted-foreground">Add a new car to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cars</h1>
          <p className="text-muted-foreground">
            Create and manage cars
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <AddCar />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by model..."
            className="pl-8"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">available</SelectItem>
            <SelectItem value="rented">rented</SelectItem>
            <SelectItem value="maintenance">maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        table={table}
        onRowClick={(row) => navigate({ to: "/cars/$carId", params: { carId: row.id } })}
      />
    </div>
  )
}

