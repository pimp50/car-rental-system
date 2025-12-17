import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { LicensePlatePublic } from "@/api/plates"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { PlateActionsMenu } from "./PlateActionsMenu"

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

export const plateColumns: ColumnDef<LicensePlatePublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "plate_number",
    header: "Plate",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.plate_number}</span>
    ),
  },
  { accessorKey: "plate_state", header: "State" },
  { accessorKey: "purchase_date", header: "Purchase Date" },
  { accessorKey: "purchase_amount", header: "Amount" },
  { accessorKey: "status", header: "Status" },
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
        <PlateActionsMenu plate={row.original} />
      </div>
    ),
  },
]
