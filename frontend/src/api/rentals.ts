
import client from "@/lib/api"

export type CarRentalPublic = {
  id: string
  car_id: string
  renter_id: string
  start_date: string
  end_date?: string | null
  total_amount: number
  frequency: string
  status: string
  payment_status: string
  paid_amount: number
  remaining_amount: number
  create_time?: string | null
  update_time?: string | null
  create_by?: string | null
  car_model?: string | null
  car_short_id?: number | null
  renter_name?: string | null
}

export type CarRentalsPublic = { data: CarRentalPublic[]; count: number }

export type CarRentalCreate = {
  car_id: string
  renter_id: string
  start_date: string
  end_date?: string
  total_amount: number
  frequency?: string
  status?: string
}

export type CarRentalUpdate = Partial<CarRentalCreate> & {
  payment_status?: string
  paid_amount?: number
  remaining_amount?: number
}

export const getRentals = async (
  skip = 0,
  limit = 100,
): Promise<CarRentalsPublic> => {
  const { data } = await client.get("/api/v1/rentals", {
    params: {
      skip,
      limit,
    },
  })
  return data
}

export const getRental = async (id: string): Promise<CarRentalPublic> => {
  const { data } = await client.get(`/api/v1/rentals/${id}`)
  return data
}

export const createRental = async (
  body: CarRentalCreate,
): Promise<CarRentalPublic> => {
  const { data } = await client.post("/api/v1/rentals", body)
  return data
}

export const updateRental = async (
  id: string,
  body: CarRentalUpdate,
): Promise<CarRentalPublic> => {
  const { data } = await client.put(`/api/v1/rentals/${id}`, body)
  return data
}

export const deleteRental = async (id: string): Promise<void> => {
  await client.delete(`/api/v1/rentals/${id}`)
}

export const payRental = async (id: string, amount: number, payment_date: string, note?: string): Promise<CarRentalPublic> => {
  const { data } = await client.post(`/api/v1/rentals/${id}/pay`, { amount, payment_date, note })
  return data
}

export type RentalPaymentPublic = {
  id: string
  rental_id: string
  amount: number
  payment_date: string
  note?: string | null
  create_by?: string | null
  create_time?: string | null
}

export type RentalPaymentsPublic = { data: RentalPaymentPublic[]; count: number }

export const getRentalPayments = async (
  id: string,
  skip = 0,
  limit = 100,
): Promise<RentalPaymentsPublic> => {
  const { data } = await client.get(`/api/v1/rentals/${id}/payments`, {
    params: {
      skip,
      limit,
    },
  })
  return data
}
