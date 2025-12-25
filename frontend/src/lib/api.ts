import axios from "axios"
import { OpenAPI } from "@/client"

const client = axios.create({ baseURL: OpenAPI.BASE })

client.interceptors.request.use(async (config) => {
  const token =
    typeof OpenAPI.TOKEN === "function"
      ? await (OpenAPI.TOKEN as any)()
      : OpenAPI.TOKEN
  if (token) {
    const headers = (config.headers || {}) as any
    headers.Authorization = `Bearer ${token}`
    config.headers = headers
  }
  return config
})

export default client
