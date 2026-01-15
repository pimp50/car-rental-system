
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { CarRentalPublic } from "@/api/rentals"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { RentalActionsMenu, RentalOperations } from "./RentalActionsMenu"
import { DataTableColumnHeader } from "@/components/Common/DataTableColumnHeader"

function CopyId({ id }: { id: string }) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === id
  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(id)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}

export const rentalColumns: ColumnDef<CarRentalPublic>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rental ID" />
    ),
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "car_short_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Car ID" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.car_short_id}</span>
    ),
  },
  {
    accessorKey: "car_model",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
  },
  {
    accessorKey: "renter_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Renter" />
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => (
      <span>{row.original.end_date || "-"}</span>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => (
      <span>${row.original.total_amount.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "remaining_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-orange-600">
        ${row.original.remaining_amount?.toFixed(2) ?? row.original.total_amount.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.payment_status
      let className = "bg-gray-100 text-gray-800"
      if (status === "paid") {
        className = "bg-green-100 text-green-800"
      } else if (status === "unpaid") {
        className = "bg-red-100 text-red-800"
      } else if (status === "cancel") {
        className = "bg-yellow-100 text-yellow-800"
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}
        >
          {status.toUpperCase()}
        </span>
      )
    },
  },
  {
    accessorKey: "update_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.update_time 
          ? format(new Date(row.original.update_time), "yyyy-MM-dd HH:mm") 
          : "-"}
      </span>
    ),
  },
  {
    id: "operations",
    header: "Operation",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RentalOperations rental={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "rental_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rental Type" />
    ),
    cell: ({ row }) => {
      const type = row.original.rental_type
      return (
        <span>
          {type === "lease_to_own" ? "Lease-to-Own" : "Lease"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RentalActionsMenu rental={row.original} />
      </div>
    ),
  },
]
