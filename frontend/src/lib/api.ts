import axios from 'axios'
import type { Lead, LeadCreate, ProspectFilter, ProspectResult, ProspectSearchResponse } from '@/types/lead'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
})

export const leadsApi = {
  list: (params?: {
    status?: string
    country?: string
    state?: string
    city?: string
    industry?: string
    seniority?: string
    company_size?: string
    source?: string
    search?: string
    skip?: number
    limit?: number
  }) => api.get<Lead[]>('/leads/', { params }).then((r) => r.data),

  get: (id: number) => api.get<Lead>(`/leads/${id}`).then((r) => r.data),

  create: (data: LeadCreate) => api.post<Lead>('/leads/', data).then((r) => r.data),

  update: (id: number, data: Partial<Pick<Lead, 'name' | 'role' | 'headline' | 'seniority' | 'status' | 'bant_score' | 'meta_data' | 'city' | 'state' | 'country' | 'industry' | 'company_size'>>) =>
    api.patch<Lead>(`/leads/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/leads/${id}`).then((r) => r.data),
}

export const prospectsApi = {
  search: (filters: ProspectFilter) =>
    api.post<ProspectSearchResponse>('/prospects/search', filters).then((r) => r.data),

  save: (prospect: ProspectResult) =>
    api.post<Lead>('/prospects/save', prospect).then((r) => r.data),

  saveBulk: (prospects: ProspectResult[]) =>
    api.post<Lead[]>('/prospects/save-bulk', prospects).then((r) => r.data),
}
