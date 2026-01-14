import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/Admin/AddUser"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import { DataTableViewOptions } from "@/components/Common/DataTableViewOptions"
import PendingUsers from "@/components/Pending/PendingUsers"
import useAuth from "@/hooks/useAuth"
import { useDataTable } from "@/hooks/useDataTable"

function getUsersQueryOptions({
  skip,
  limit,
}: {
  skip?: number
  limit?: number
} = {}) {
  return {
    queryFn: () => UsersService.readUsers({ skip, limit }),
    queryKey: ["users", { skip, limit }],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  head: () => ({
    meta: [
      {
        title: "Admin - Inspiration",
      },
    ],
  }),
})

function Admin() {
  const { user: currentUser } = useAuth()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: users, isPending } = useQuery(
    getUsersQueryOptions({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    })
  )

  const tableData: UserTableData[] = (users?.data ?? []).map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  const table = useDataTable({
    data: tableData,
    columns: columns,
    pageCount: users ? Math.ceil(users.count / pagination.pageSize) : 0,
    id: "admin-users-table",
    pagination,
    onPaginationChange: setPagination,
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddUser />
          </div>
        </div>
        <PendingUsers />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <AddUser />
        </div>
      </div>
      <DataTable table={table} />
    </div>
  )
}
