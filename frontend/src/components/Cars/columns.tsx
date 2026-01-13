import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { CarPublic } from "@/api/cars"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { CarActionsMenu } from "./CarActionsMenu"

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
        onClick={(e) => {
           e.stopPropagation()
           copy(id)
        }}
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

export const carColumns: ColumnDef<CarPublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "plate_number",
    header: "Plate",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "registration_expires_at",
    header: "Reg Expires",
    cell: ({ row }) => {
        const date = row.original.registration_expires_at
        return date ? new Date(date).toLocaleDateString() : "-"
    }
  },
  {
    accessorKey: "insurance_expires_at",
    header: "Ins Expires",
    cell: ({ row }) => {
        const date = row.original.insurance_expires_at
        return date ? new Date(date).toLocaleDateString() : "-"
    }
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes
      return (
        <span
          className={cn(
            "max-w-xs truncate block text-muted-foreground",
            !notes && "italic",
          )}
        >
          {notes || "No notes"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CarActionsMenu car={row.original} />
      </div>
    ),
  },
]
