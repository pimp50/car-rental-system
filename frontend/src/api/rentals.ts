
import client from "@/lib/api"

export type CarRentalPublic = {
  id: string
  car_id: string
  renter_id: string
  start_date: string
  end_date?: string | null
  rent_amount: number
  frequency: string
  status: string
}

export type CarRentalsPublic = { data: CarRentalPublic[]; count: number }

export type CarRentalCreate = {
  car_id: string
  renter_id: string
  start_date: string
  end_date?: string
  rent_amount: number
  frequency?: string
  status?: string
}

export type CarRentalUpdate = Partial<CarRentalCreate>

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
