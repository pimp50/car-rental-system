
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getCars } from "@/api/cars"
import { getRenters } from "@/api/renters"
import { createRental, type CarRentalCreate } from "@/api/rentals"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  car_id: z.string().min(1, "Car is required"),
  renter_id: z.string().min(1, "Renter is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  total_amount: z.string().min(1, "Total amount is required"),
  frequency: z.string().default("monthly"),
  status: z.string().default("active"),
})

type FormData = z.infer<typeof formSchema>

const AddRental = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: cars } = useQuery({
    queryKey: ["cars", "available"],
    queryFn: () => getCars(0, 1000, undefined, undefined, "available"),
    enabled: isOpen,
  })

  const { data: renters } = useQuery({
    queryKey: ["renters"],
    queryFn: () => getRenters(0, 1000),
    enabled: isOpen,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      car_id: "",
      renter_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
      total_amount: "",
      frequency: "monthly",
      status: "active",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CarRentalCreate) => createRental(data),
    onSuccess: () => {
      showSuccessToast("Rental created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] })
      queryClient.invalidateQueries({ queryKey: ["cars"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      total_amount: Number(data.total_amount),
      end_date: data.end_date || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Rental
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-visible">
        <DialogHeader>
          <DialogTitle>Add Car Rental</DialogTitle>
          <DialogDescription>
            Create a new rental record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="car_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a car" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {cars?.data.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.car_id} - {car.model} - {car.plate_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="renter_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renter</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a renter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {renters?.data.map((renter) => (
                        <SelectItem key={renter.id} value={renter.id}>
                          {renter.full_name} ({renter.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="-">-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddRental
