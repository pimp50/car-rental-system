import {
  type ColumnDef,
  type ColumnOrderState,
  type SortingState,
  type PaginationState,
  getCoreRowModel,
  getSortedRowModel,
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
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  id,
  initialVisibility = {},
  pagination,
  onPaginationChange,
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

  const [sorting, setSorting] = useState<SortingState>([])

  // Internal state for pagination if not controlled
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Use controlled or internal state
  const actualPagination = pagination ?? internalPagination
  const handlePaginationChange = (updaterOrValue: any) => {
    const newPagination = typeof updaterOrValue === 'function' 
      ? updaterOrValue(actualPagination)
      : updaterOrValue
    
    if (onPaginationChange) {
      onPaginationChange(newPagination)
    } else {
      setInternalPagination(newPagination)
    }
  }

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
      sorting,
      pagination: actualPagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // Removed because we do manual pagination
    getSortedRowModel: getSortedRowModel(),
    pageCount: pageCount ?? -1, // -1 means unknown page count, or use provided
    manualPagination: true,
  })

  return table
}
