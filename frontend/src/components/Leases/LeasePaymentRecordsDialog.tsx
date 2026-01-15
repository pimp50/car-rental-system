
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import type { PlateLeasePublic } from "@/api/leases"
import { getLeasePayments } from "@/api/leases"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LeasePaymentRecordsDialogProps {
  lease: PlateLeasePublic
  isOpen: boolean
  onClose: () => void
}

export function LeasePaymentRecordsDialog({ lease, isOpen, onClose }: LeasePaymentRecordsDialogProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["lease-payments", lease.id],
    queryFn: () => getLeasePayments(lease.id),
    enabled: isOpen,
  })
  
  const paymentsWithRemaining = payments?.data ? [...payments.data].sort((a, b) => {
    return new Date(a.create_time || 0).getTime() - new Date(b.create_time || 0).getTime()
  }).reduce((acc, payment, index) => {
    const prevPaid = index > 0 ? acc[index - 1].accumulatedPaid : 0
    const accumulatedPaid = prevPaid + payment.amount
    const remaining = Math.max(0, lease.total_amount - accumulatedPaid)
    
    acc.push({
      ...payment,
      accumulatedPaid,
      remaining
    })
    return acc
  }, [] as any[]) : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Records</DialogTitle>
          <DialogDescription>
            History of payments for this lease. Total: ${lease.total_amount}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Date</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Modified By</TableHead>
                <TableHead>Modified Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsWithRemaining.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                paymentsWithRemaining.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>${payment.remaining.toFixed(2)}</TableCell>
                    <TableCell>{payment.note || "-"}</TableCell>
                    <TableCell>{payment.create_by || "-"}</TableCell>
                    <TableCell>
                      {payment.create_time ? format(new Date(payment.create_time), "yyyy-MM-dd HH:mm") : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
