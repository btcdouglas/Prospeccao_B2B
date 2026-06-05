'use client'

import { useState } from 'react'
import type { ProspectFilter, ProspectSearchResponse } from '@/types/lead'
import { prospectsApi } from '@/lib/api'
import ProspectFilters from '@/components/ProspectFilters'
import ProspectResults from '@/components/ProspectResults'

export default function ProspectsPage() {
  const [data, setData] = useState<ProspectSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<ProspectFilter>({})
  const [error, setError] = useState<string | null>(null)

  const search = async (filters: ProspectFilter) => {
    setLoading(true)
    setError(null)
    setCurrentFilters(filters)
    try {
      const result = await prospectsApi.search(filters)
      setData(result)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Erro ao buscar prospects')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    search({ ...currentFilters, page })
  }

  return (
    <div className="flex h-[calc(100vh-49px)] overflow-hidden">
      <ProspectFilters onSearch={search} loading={loading} />

      <main className="flex flex-1 flex-col overflow-hidden">
        {error && (
          <div className="m-4 rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <ProspectResults
          data={data}
          loading={loading}
          onPageChange={handlePageChange}
          onSaved={() => {
            if (data) setData({ ...data })
          }}
        />
      </main>
    </div>
  )
}
