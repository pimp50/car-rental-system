
import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div 
      className={cn("flex items-center gap-1 cursor-pointer group select-none hover:text-accent-foreground", className)}
      onClick={column.getToggleSortingHandler()}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      )}
    </div>
  )
}
