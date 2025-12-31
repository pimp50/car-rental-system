import client from "@/lib/api"

export type RenterPublic = {
  id: string
  full_name: string
  phone: string
  email?: string | null
  driver_license_number: string
  driver_license_state: string
  address?: string | null
}

export type RentersPublic = { data: RenterPublic[]; count: number }

export type RenterCreate = {
  full_name: string
  phone: string
  email?: string
  driver_license_number: string
  driver_license_state?: string
  address?: string
}

export type RenterUpdate = Partial<RenterCreate>

export const getRenters = async (
  skip = 0,
  limit = 100,
  search?: string,
): Promise<RentersPublic> => {
  const { data } = await client.get("/api/v1/renters", {
    params: {
      skip,
      limit,
      search,
    },
  })
  return data
}

export const getRenter = async (id: string): Promise<RenterPublic> => {
  const { data } = await client.get(`/api/v1/renters/${id}`)
  return data
}

export const createRenter = async (
  body: RenterCreate,
): Promise<RenterPublic> => {
  const { data } = await client.post("/api/v1/renters", body)
  return data
}

export const updateRenter = async (
  id: string,
  body: RenterUpdate,
): Promise<RenterPublic> => {
  const { data } = await client.put(`/api/v1/renters/${id}`, body)
  return data
}

export const deleteRenter = async (id: string): Promise<void> => {
  await client.delete(`/api/v1/renters/${id}`)
}
