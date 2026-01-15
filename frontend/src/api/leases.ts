import client from "@/lib/api"

export type PlateLeasePublic = {
  id: string
  plate_id: string
  renter_id: string
  start_date: string
  end_date?: string | null
  total_amount: number
  frequency: string
  status: string
  payment_status: string
  paid_amount: number
  remaining_amount: number
  rental_type: string
  create_time?: string | null
  update_time?: string | null
  create_by?: string | null
  plate_number?: string | null
  renter_name?: string | null
}

export type PlateLeasesPublic = { data: PlateLeasePublic[]; count: number }

export type PlateLeaseCreate = {
  plate_id: string
  renter_id: string
  start_date: string
  end_date?: string
  total_amount: number
  frequency?: string
  status?: string
  rental_type?: string
}

export type PlateLeaseUpdate = Partial<PlateLeaseCreate> & {
  payment_status?: string
  paid_amount?: number
  remaining_amount?: number
}

export type PlatePaymentPublic = {
  id: string
  lease_id: string
  amount: number
  payment_date: string
  note?: string | null
  create_by?: string | null
  create_time?: string | null
}

export type PlatePaymentsPublic = { data: PlatePaymentPublic[]; count: number }

export const getLeases = async (
  skip = 0,
  limit = 100,
  plate_number?: string,
  renter_name?: string,
  status?: string,
): Promise<PlateLeasesPublic> => {
  const { data } = await client.get("/api/v1/leases", {
    params: {
      skip,
      limit,
      plate_number,
      renter_name,
      status,
    },
  })
  return data
}

export const getLease = async (id: string): Promise<PlateLeasePublic> => {
  const { data } = await client.get(`/api/v1/leases/${id}`)
  return data
}

export const createLease = async (
  body: PlateLeaseCreate,
): Promise<PlateLeasePublic> => {
  const { data } = await client.post("/api/v1/leases", body)
  return data
}

export const updateLease = async (
  id: string,
  body: PlateLeaseUpdate,
): Promise<PlateLeasePublic> => {
  const { data } = await client.put(`/api/v1/leases/${id}`, body)
  return data
}

export const deleteLease = async (id: string): Promise<void> => {
  await client.delete(`/api/v1/leases/${id}`)
}

export const payLease = async (id: string, amount: number, payment_date: string, note?: string): Promise<PlateLeasePublic> => {
  const { data } = await client.post(`/api/v1/leases/${id}/pay`, {
    amount,
    payment_date,
    note
  })
  return data
}

export const freezeLease = async (id: string): Promise<PlateLeasePublic> => {
  const { data } = await client.post(`/api/v1/leases/${id}/freeze`)
  return data
}

export const getLeasePayments = async (id: string, skip = 0, limit = 100): Promise<PlatePaymentsPublic> => {
  const { data } = await client.get(`/api/v1/leases/${id}/payments`, {
    params: { skip, limit }
  })
  return data
}
