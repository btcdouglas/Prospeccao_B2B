export interface Lead {
  id: number
  email: string
  name?: string | null
  company: string
  company_domain: string
  role?: string | null
  headline?: string | null
  seniority?: string | null
  linkedin_url?: string | null
  phone?: string | null
  photo_url?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  industry?: string | null
  company_size?: string | null
  annual_revenue?: string | null
  tech_stack: string[]
  meta_data: Record<string, unknown>
  bant_score: number
  status: string
  source: string
  apollo_id?: string | null
  campaign_id?: number | null
  created_at: string
  updated_at: string
}

export interface LeadCreate {
  email: string
  name?: string
  company: string
  company_domain: string
  role?: string
  headline?: string
  seniority?: string
  linkedin_url?: string
  phone?: string
  photo_url?: string
  city?: string
  state?: string
  country?: string
  industry?: string
  company_size?: string
  annual_revenue?: string
  tech_stack?: string[]
  meta_data?: Record<string, unknown>
  source?: string
  apollo_id?: string
}

export interface ProspectFilter {
  titles?: string[]
  seniorities?: string[]
  locations?: string[]
  countries?: string[]
  industries?: string[]
  company_sizes?: string[]
  technologies?: string[]
  keywords?: string
  page?: number
  per_page?: number
}

export interface ProspectResult {
  apollo_id?: string
  name?: string
  email?: string
  email_status?: string
  role?: string
  headline?: string
  seniority?: string
  linkedin_url?: string
  photo_url?: string
  city?: string
  state?: string
  country?: string
  company?: string
  company_domain?: string
  industry?: string
  company_size?: string
  annual_revenue?: string
  tech_stack: string[]
  already_saved: boolean
}

export interface ProspectSearchResponse {
  results: ProspectResult[]
  total: number
  page: number
  total_pages: number
}
