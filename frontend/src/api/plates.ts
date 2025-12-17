import client from "@/lib/api"

export type LicensePlatePublic = {
  id: string
  plate_number: string
  plate_state: string
  purchase_date: string
  purchase_amount: number
  status: string
  notes?: string | null
}

export type LicensePlatesPublic = { data: LicensePlatePublic[]; count: number }

export type LicensePlateCreate = {
  plate_number: string
  plate_state?: string
  purchase_date: string
  purchase_amount: number
  status?: string
  notes?: string
}

export type LicensePlateUpdate = Partial<LicensePlateCreate>

export const getPlates = async (
  skip = 0,
  limit = 100,
  plate_number?: string,
  status?: string,
): Promise<LicensePlatesPublic> => {
  const { data } = await client.get("/api/v1/plates", {
    params: {
      skip,
      limit,
      plate_number,
      status,
    },
  })
  return data
}

export const createPlate = async (
  body: LicensePlateCreate,
): Promise<LicensePlatePublic> => {
  const { data } = await client.post("/api/v1/plates", body)
  return data
}

export const updatePlate = async (
  id: string,
  body: LicensePlateUpdate,
): Promise<LicensePlatePublic> => {
  const { data } = await client.put(`/api/v1/plates/${id}`, body)
  return data
}

export const deletePlate = async (id: string): Promise<void> => {
  await client.delete(`/api/v1/plates/${id}`)
}
