import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Trash2, Snowflake } from "lucide-react"
import { useState } from "react"

import type { PlateLeasePublic } from "@/api/leases"
import { deleteLease, freezeLease } from "@/api/leases"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

import { PayLeaseDialog } from "./PayLeaseDialog"
import { LeasePaymentRecordsDialog } from "./LeasePaymentRecordsDialog"

interface LeaseActionsMenuProps {
  lease: PlateLeasePublic
}

export function LeaseOperations({ lease }: LeaseActionsMenuProps) {
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [recordsDialogOpen, setRecordsDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 justify-center">
        {lease.payment_status === "unpaid" && (
          <Button 
            variant="link"
            className="text-primary h-auto p-0 text-sm font-medium"
            onClick={() => setPayDialogOpen(true)}
          >
            Pay
          </Button>
        )}
        
        <Button 
          variant="link"
          className="text-primary h-auto p-0 text-sm font-medium"
          onClick={() => setRecordsDialogOpen(true)}
        >
          View Records
        </Button>
      </div>

      {payDialogOpen && (
        <PayLeaseDialog 
          lease={lease} 
          isOpen={payDialogOpen} 
          onClose={() => setPayDialogOpen(false)} 
        />
      )}

      {recordsDialogOpen && (
        <LeasePaymentRecordsDialog
          lease={lease}
          isOpen={recordsDialogOpen}
          onClose={() => setRecordsDialogOpen(false)}
        />
      )}
    </>
  )
}

export function LeaseActionsMenu({ lease }: LeaseActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const deleteMutation = useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      showSuccessToast("Lease deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["leases"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const freezeMutation = useMutation({
    mutationFn: freezeLease,
    onSuccess: () => {
      showSuccessToast("Lease frozen successfully")
      queryClient.invalidateQueries({ queryKey: ["leases"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <>
      <div className="flex items-center justify-center">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFreezeDialogOpen(true)}>
              <Snowflake className="mr-2 h-4 w-4" />
              Freeze
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the payment status to 'cancel' and free the plate (set to 'available').
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                freezeMutation.mutate(lease.id)
                setFreezeDialogOpen(false)
              }}
            >
              Freeze
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lease record and might affect the plate status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                deleteMutation.mutate(lease.id)
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

