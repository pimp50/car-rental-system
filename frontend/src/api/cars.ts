import client from "@/lib/api"

export type CarPublic = {
  id: string
  car_id?: number | null
  model: string
  wav: number
  marker?: string | null
  color?: string | null
  year: number
  vin_number?: string | null
  plate_number?: string | null
  state: string
  registration_expires_at?: string | null
  insurance_expires_at?: string | null
  price?: number | null
  installation_fee_for_safety_equipment?: number | null
  insurance_expenses?: number | null
  service_expenses?: number | null
  maintenance_costs?: number | null
  full_coverage_auto_insurance?: number | null
  other_expenses?: number | null
  status: string
  notes?: string | null
  create_by?: string | null
  create_time?: string | null
  update_time?: string | null
}

export type CarsPublic = { data: CarPublic[]; count: number }

export type CarCreate = {
  car_id?: number | null
  model: string
  wav?: number
  marker?: string
  color?: string
  year: number
  vin_number?: string
  plate_number?: string
  state?: string
  registration_expires_at?: string
  insurance_expires_at?: string
  price?: number
  installation_fee_for_safety_equipment?: number
  insurance_expenses?: number
  service_expenses?: number
  maintenance_costs?: number
  full_coverage_auto_insurance?: number
  other_expenses?: number
  status?: string
  notes?: string
}

export type CarUpdate = Partial<CarCreate>

export const getCars = async (
  skip = 0,
  limit = 100,
  model?: string,
  plate_number?: string,
  status?: string,
): Promise<CarsPublic> => {
  const { data } = await client.get("/api/v1/cars", {
    params: {
      skip,
      limit,
      model,
      plate_number,
      status,
    },
  })
  return data
}

export const getCar = async (id: string): Promise<CarPublic> => {
  const { data } = await client.get(`/api/v1/cars/${id}`)
  return data
}

export const createCar = async (body: CarCreate): Promise<CarPublic> => {
  const { data } = await client.post("/api/v1/cars", body)
  return data
}

export const updateCar = async (id: string, body: CarUpdate): Promise<CarPublic> => {
  const { data } = await client.put(`/api/v1/cars/${id}`, body)
  return data
}

export const deleteCar = async (id: string): Promise<void> => {
  await client.delete(`/api/v1/cars/${id}`)
}
