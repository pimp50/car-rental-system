import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { createLease, type PlateLeaseCreate } from "@/api/leases"
import { getPlates } from "@/api/plates"
import { getRenters } from "@/api/renters"
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
  plate_id: z.string().min(1),
  renter_id: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  rent_amount: z.string().min(1),
  frequency: z.string().min(1),
  status: z.string().min(1),
})

type FormData = z.infer<typeof formSchema>

function getPlatesQueryOptions() {
  return { queryFn: () => getPlates(), queryKey: ["plates"] }
}

function getRentersQueryOptions() {
  return { queryFn: () => getRenters(), queryKey: ["renters"] }
}

const AddLease = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const platesQuery = useSuspenseQuery(getPlatesQueryOptions())
  const rentersQuery = useSuspenseQuery(getRentersQueryOptions())

  const form = useForm<FormData, any, FormData>({
    resolver: zodResolver<FormData, any, FormData>(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      plate_id: "",
      renter_id: "",
      start_date: "",
      end_date: "",
      rent_amount: "0",
      frequency: "monthly",
      status: "active",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PlateLeaseCreate) => createLease(data),
    onSuccess: () => {
      showSuccessToast("Lease created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] })
      queryClient.invalidateQueries({ queryKey: ["plates"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      plate_id: data.plate_id,
      renter_id: data.renter_id,
      start_date: data.start_date,
      end_date: data.end_date,
      rent_amount: Number(data.rent_amount),
      frequency: data.frequency,
      status: data.status,
    })
  }

  const plates = platesQuery.data.data
  const renters = rentersQuery.data.data

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lease</DialogTitle>
          <DialogDescription>Assign a plate to a renter.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField<FormData, "plate_id">
                control={form.control}
                name="plate_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Plate <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plate" />
                        </SelectTrigger>
                        <SelectContent>
                          {plates.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.plate_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "renter_id">
                control={form.control}
                name="renter_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Renter <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select renter" />
                        </SelectTrigger>
                        <SelectContent>
                          {renters.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "start_date">
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="YYYY-MM-DD"
                        type="date"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "end_date">
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM-DD" type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "rent_amount">
                control={form.control}
                name="rent_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rent Amount <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        step="0.01"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "frequency">
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">monthly</SelectItem>
                          <SelectItem value="weekly">weekly</SelectItem>
                          <SelectItem value="daily">daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<FormData, "status">
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="ended">ended</SelectItem>
                          <SelectItem value="paused">paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
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

export default AddLease
