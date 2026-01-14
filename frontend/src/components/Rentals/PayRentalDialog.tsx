
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { payRental, type CarRentalPublic } from "@/api/rentals"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_date: z.string().min(1, "Payment date is required"),
  note: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PayRentalDialogProps {
  rental: CarRentalPublic
  isOpen: boolean
  onClose: () => void
}

export function PayRentalDialog({ rental, isOpen, onClose }: PayRentalDialogProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  
  const remainingAmount = rental.total_amount - rental.paid_amount

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      note: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: { amount: number; payment_date: string; note?: string }) => 
      payRental(rental.id, data.amount, data.payment_date, data.note),
    onSuccess: () => {
      showSuccessToast("Payment recorded successfully")
      form.reset()
      onClose()
      queryClient.invalidateQueries({ queryKey: ["rentals"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    const amount = Number(data.amount)
    if (amount <= 0) {
      form.setError("amount", { message: "Amount must be greater than 0" })
      return
    }
    if (amount > remainingAmount) {
      form.setError("amount", { message: `Amount cannot exceed remaining balance (${remainingAmount})` })
      return
    }
    mutation.mutate({
      amount: amount,
      payment_date: data.payment_date,
      note: data.note || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Rental</DialogTitle>
          <DialogDescription>
            Record a payment for this rental.
            <br />
            Total: {rental.total_amount}, Paid: {rental.paid_amount}, Remaining: {remainingAmount}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" max={remainingAmount} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Pay
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
