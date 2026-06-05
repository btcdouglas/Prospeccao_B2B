'use client'

import { useEffect, useState } from 'react'
import { leadsApi } from '@/lib/api'
import type { Lead } from '@/types/lead'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300',
  qualified: 'bg-green-500/20 text-green-300',
  contacted: 'bg-yellow-500/20 text-yellow-300',
  disqualified: 'bg-red-500/20 text-red-300',
}

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    leadsApi
      .list()
      .then(setLeads)
      .catch(() => setError('Erro ao carregar leads'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400">Carregando leads...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">
          Leads <span className="text-gray-500 font-normal">({leads.length})</span>
        </h2>
      </div>

      {leads.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum lead cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">BANT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="bg-gray-900/50 hover:bg-gray-800/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{lead.company}</td>
                  <td className="px-4 py-3 text-gray-400">{lead.role ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-700 text-gray-300'}`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-mono font-bold ${lead.bant_score >= 70 ? 'text-green-400' : lead.bant_score >= 40 ? 'text-yellow-400' : 'text-gray-500'}`}
                    >
                      {lead.bant_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
