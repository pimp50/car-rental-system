import client from "@/lib/api"

export type PlateLeasePublic = {
  id: string
  plate_id: string
  renter_id: string
  start_date: string
  end_date?: string | null
  rent_amount: number
  frequency: string
  status: string
}

export type PlateLeasesPublic = { data: PlateLeasePublic[]; count: number }

export type PlateLeaseCreate = {
  plate_id: string
  renter_id: string
  start_date: string
  end_date?: string
  rent_amount: number
  frequency?: string
  status?: string
}

export type PlateLeaseUpdate = Partial<PlateLeaseCreate>

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
