import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getLease, updateLease, type PlateLeaseUpdate } from "@/api/leases"
import { getPlates } from "@/api/plates"
import { getRenters } from "@/api/renters"
import { Button } from "@/components/ui/button"
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
  plate_id: z.string().min(1, { message: "Plate is required" }),
  renter_id: z.string().min(1, { message: "Renter is required" }),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().optional().or(z.literal("")),
  total_amount: z.string().min(1, { message: "Amount is required" }),
  frequency: z.string().min(1, { message: "Frequency is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  rental_type: z.string().min(1),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/_layout/leases/$leaseId")({
  component: LeaseDetail,
})

function LeaseDetail() {
  const { leaseId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: lease, isLoading: isLeaseLoading } = useQuery({
    queryKey: ["leases", leaseId],
    queryFn: () => getLease(leaseId),
  })

  const { data: platesData, isLoading: isPlatesLoading } = useQuery({
    queryKey: ["plates"],
    queryFn: () => getPlates(),
  })

  const { data: rentersData, isLoading: isRentersLoading } = useQuery({
    queryKey: ["renters"],
    queryFn: () => getRenters(),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    values: lease
      ? {
          plate_id: lease.plate_id,
          renter_id: lease.renter_id,
          start_date: lease.start_date,
          end_date: lease.end_date || "",
          total_amount: String(lease.total_amount),
          frequency: lease.frequency,
          status: lease.status,
          rental_type: lease.rental_type || "lease",
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: PlateLeaseUpdate) => updateLease(leaseId, data),
    onSuccess: () => {
      showSuccessToast("Lease updated successfully")
      queryClient.invalidateQueries({ queryKey: ["leases"] })
      navigate({ to: "/leases" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      plate_id: data.plate_id,
      renter_id: data.renter_id,
      start_date: data.start_date,
      end_date: data.end_date || undefined,
      total_amount: Number(data.total_amount),
      frequency: data.frequency,
      status: data.status,
      rental_type: data.rental_type,
    })
  }

  if (isLeaseLoading || isPlatesLoading || isRentersLoading) {
    return <div className="p-8">Loading...</div>
  }

  const plates = platesData?.data || []
  const renters = rentersData?.data || []

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Lease</h1>
        <p className="text-muted-foreground">Update lease details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="plate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Plate <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <FormField
            control={form.control}
            name="renter_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Renter <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Start Date <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormLabel>
                    Total Amount <span className="text-destructive">*</span>
                  </FormLabel>
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
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="rental_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">Lease</SelectItem>
                        <SelectItem value="lease_to_own">Lease-to-Own</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/leases" })}
            >
              Cancel
            </Button>
            <LoadingButton type="submit" loading={mutation.isPending}>
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </Form>
    </div>
  )
}
