import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { createCar, type CarCreate } from "@/api/cars"
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
import { Checkbox } from "@/components/ui/checkbox"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  wav: z.boolean(),
  marker: z.string().optional(),
  color: z.string().optional(),
  year: z.string().min(4, "Year is required"),
  vin_number: z.string().optional(),
  plate_number: z.string().optional(),
  state: z.string().min(2).max(2),
  registration_expires_at: z.string().optional(),
  insurance_expires_at: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  status: z.string().min(1),
  notes: z.string().optional(),
  installation_fee_for_safety_equipment: z.string().optional(),
  insurance_expenses: z.string().optional(),
  service_expenses: z.string().optional(),
  maintenance_costs: z.string().optional(),
  full_coverage_auto_insurance: z.string().optional(),
  other_expenses: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const AddCar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver<FormData, any, FormData>(formSchema),
    defaultValues: {
      model: "",
      wav: false,
      marker: "premium",
      color: "",
      year: new Date().getFullYear().toString(),
      state: "NY",
      status: "available",
      notes: "",
      price: "",
      installation_fee_for_safety_equipment: "",
      insurance_expenses: "",
      service_expenses: "",
      maintenance_costs: "",
      full_coverage_auto_insurance: "",
      other_expenses: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CarCreate) => createCar(data),
    onSuccess: () => {
      showSuccessToast("Car created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      year: Number(data.year),
      price: Number(data.price),
      wav: data.wav ? 1 : 0,
      registration_expires_at: data.registration_expires_at || undefined,
      insurance_expires_at: data.insurance_expires_at || undefined,
      installation_fee_for_safety_equipment: data.installation_fee_for_safety_equipment ? Number(data.installation_fee_for_safety_equipment) : undefined,
      insurance_expenses: data.insurance_expenses ? Number(data.insurance_expenses) : undefined,
      service_expenses: data.service_expenses ? Number(data.service_expenses) : undefined,
      maintenance_costs: data.maintenance_costs ? Number(data.maintenance_costs) : undefined,
      full_coverage_auto_insurance: data.full_coverage_auto_insurance ? Number(data.full_coverage_auto_insurance) : undefined,
      other_expenses: data.other_expenses ? Number(data.other_expenses) : undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Car
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Car</DialogTitle>
          <DialogDescription>
            Fill in details to add a new car.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField<FormData, "model">
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Honda Odyssey 2013" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "year">
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "color">
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "plate_number">
                  control={form.control}
                  name="plate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plate Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="T761657C" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField<FormData, "vin_number">
                  control={form.control}
                  name="vin_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "state">
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "marker">
                  control={form.control}
                  name="marker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marker</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="premium" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">available</SelectItem>
                          <SelectItem value="rented">rented</SelectItem>
                          <SelectItem value="maintenance">maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField<FormData, "price">
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "installation_fee_for_safety_equipment">
                  control={form.control}
                  name="installation_fee_for_safety_equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Install Fee (Safety)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "insurance_expenses">
                  control={form.control}
                  name="insurance_expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Exp.</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "service_expenses">
                  control={form.control}
                  name="service_expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Exp.</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "maintenance_costs">
                  control={form.control}
                  name="maintenance_costs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Costs</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "full_coverage_auto_insurance">
                  control={form.control}
                  name="full_coverage_auto_insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Coverage Ins.</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "other_expenses">
                  control={form.control}
                  name="other_expenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Expenses</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField<FormData, "wav">
                  control={form.control}
                  name="wav"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Wheelchair Accessible (WAV)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField<FormData, "registration_expires_at">
                  control={form.control}
                  name="registration_expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reg. Expires</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData, "insurance_expires_at">
                  control={form.control}
                  name="insurance_expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ins. Expires</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField<FormData, "notes">
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

export default AddCar
