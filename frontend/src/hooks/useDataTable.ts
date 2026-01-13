import {
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"

interface UseDataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  pageCount?: number
  id?: string
  initialVisibility?: VisibilityState
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  id,
  initialVisibility = {},
}: UseDataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (id) {
        const saved = localStorage.getItem(`${id}-visibility`)
        if (saved) {
          try {
            return JSON.parse(saved)
          } catch (e) {
            console.error("Failed to parse saved visibility", e)
          }
        }
      }
      return initialVisibility
    },
  )

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (id) {
      const saved = localStorage.getItem(`${id}-order`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved order", e)
        }
      }
    }
    return []
  })

  // Save state to localStorage on change
  useEffect(() => {
    if (id) {
      localStorage.setItem(`${id}-visibility`, JSON.stringify(columnVisibility))
    }
  }, [id, columnVisibility])

  useEffect(() => {
    if (id && columnOrder.length > 0) {
      localStorage.setItem(`${id}-order`, JSON.stringify(columnOrder))
    }
  }, [id, columnOrder])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: pageCount,
  })

  return table
}
