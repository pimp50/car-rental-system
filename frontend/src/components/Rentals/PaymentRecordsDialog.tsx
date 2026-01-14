
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import type { CarRentalPublic } from "@/api/rentals"
import { getRentalPayments } from "@/api/rentals"
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

interface PaymentRecordsDialogProps {
  rental: CarRentalPublic
  isOpen: boolean
  onClose: () => void
}

export function PaymentRecordsDialog({ rental, isOpen, onClose }: PaymentRecordsDialogProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["rental-payments", rental.id],
    queryFn: () => getRentalPayments(rental.id),
    enabled: isOpen,
  })
  
  // Calculate remaining amount for each record in history
  // Note: This logic assumes payments are ordered by date descending (newest first)
  // But to calculate running balance correctly, we might need them ascending or calculate from total
  
  // Let's just display the fields as requested: 支付时间，支付金额，剩余金额，备注，修改人，修改时间
  // Remaining amount logic: 
  // If we display latest first:
  // Payment 2: 50. Remaining: (Total - Paid1 - Paid2)
  // Payment 1: 100. Remaining: (Total - Paid1)
  
  // Actually, simpler is to just calculate it on the fly or if the user meant "Remaining amount AFTER this payment"
  
  // Calculate accumulated payments to show correct remaining amount at that point in time.
  // Sort by Modified Time (create_time) ascending to calculate running total
  
  const paymentsWithRemaining = payments?.data ? [...payments.data].sort((a, b) => {
    return new Date(a.create_time || 0).getTime() - new Date(b.create_time || 0).getTime()
  }).reduce((acc, payment, index) => {
    const prevPaid = index > 0 ? acc[index - 1].accumulatedPaid : 0
    const accumulatedPaid = prevPaid + payment.amount
    const remaining = Math.max(0, rental.total_amount - accumulatedPaid)
    
    acc.push({
      ...payment,
      accumulatedPaid,
      remaining
    })
    return acc
  }, [] as any[]) : [] // Keep ascending order as requested (Modified Time sequence)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Records</DialogTitle>
          <DialogDescription>
            History of payments for this rental. Total: ${rental.total_amount}
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
