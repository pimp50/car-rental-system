import type { ColumnDef } from "@tanstack/react-table"

import type { PlateLeasePublic } from "@/api/leases"
import { DataTableColumnHeader } from "@/components/Common/DataTableColumnHeader"

import { LeaseActionsMenu, LeaseOperations } from "./LeaseActionsMenu"

export const leaseColumns: ColumnDef<PlateLeasePublic>[] = [
  {
    accessorKey: "plate_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plate Number" />
    ),
    cell: ({ row }) => {
      const plateNumber = row.original.plate_number
      return (
        <span className="font-medium">
          {plateNumber || "-"}
        </span>
      )
    }
  },
  {
    accessorKey: "renter_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Renter" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {row.original.renter_name || "-"}
        </span>
      )
    }
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
    cell: ({ row }) => row.original.end_date || "-",
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.original.total_amount
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    },
  },
  {
    accessorKey: "remaining_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remaining" />
    ),
    cell: ({ row }) => {
      const amount = row.original.remaining_amount
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    },
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
    id: "operations",
    header: "Operation",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <LeaseOperations lease={row.original} />
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
        <LeaseActionsMenu lease={row.original} />
      </div>
    ),
  },
]
