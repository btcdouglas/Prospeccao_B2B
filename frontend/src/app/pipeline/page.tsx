'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Lead } from '@/types/lead'
import { leadsApi } from '@/lib/api'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-gray-700 text-gray-300' },
  contacted: { label: 'Contactado', color: 'bg-blue-900/60 text-blue-300' },
  qualified: { label: 'Qualificado', color: 'bg-green-900/60 text-green-300' },
  negotiating: { label: 'Negociando', color: 'bg-yellow-900/60 text-yellow-300' },
  lost: { label: 'Perdido', color: 'bg-red-900/50 text-red-400' },
}

const STATUSES = Object.keys(STATUS_CONFIG)
const SENIORITIES = ['C-Level', 'VP', 'Director', 'Manager', 'Senior', 'Entry', 'Owner', 'Founder']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+']
const SOURCES = ['manual', 'apollo', 'csv', 'scraped']

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-700 text-gray-300' }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
}

function BantScore({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-gray-500'
  return <span className={`font-mono font-bold ${color}`}>{score}</span>
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number[]>([])

  const [filterStatus, setFilterStatus] = useState('')
  const [filterSeniority, setFilterSeniority] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await leadsApi.list({
        status: filterStatus || undefined,
        seniority: filterSeniority || undefined,
        company_size: filterSize || undefined,
        source: filterSource || undefined,
        country: filterCountry || undefined,
        search: search || undefined,
        limit: 200,
      })
      setLeads(data)
    } catch {
      setError('Erro ao carregar pipeline')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterSeniority, filterSize, filterSource, filterCountry, search])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id: number, status: string) => {
    await leadsApi.update(id, { status })
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este lead do pipeline?')) return
    await leadsApi.delete(id)
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const toggleSelect = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleBulkStatus = async (status: string) => {
    await Promise.all(selected.map((id) => leadsApi.update(id, { status })))
    setLeads((prev) => prev.map((l) => (selected.includes(l.id) ? { ...l, status } : l)))
    setSelected([])
  }

  return (
    <div className="flex h-[calc(100vh-49px)] flex-col overflow-hidden p-4 gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="Buscar nome, empresa, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {[
          { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: STATUSES, display: (v: string) => STATUS_CONFIG[v]?.label ?? v },
          { label: 'Senioridade', value: filterSeniority, onChange: setFilterSeniority, options: SENIORITIES, display: (v: string) => v },
          { label: 'Tamanho', value: filterSize, onChange: setFilterSize, options: COMPANY_SIZES, display: (v: string) => v },
          { label: 'Fonte', value: filterSource, onChange: setFilterSource, options: SOURCES, display: (v: string) => v },
        ].map(({ label, value, onChange, options, display }) => (
          <select
            key={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="">{label}</option>
            {options.map((o) => <option key={o} value={o}>{display(o)}</option>)}
          </select>
        ))}

        <input
          className="rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="País..."
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
        />

        <button
          onClick={() => { setFilterStatus(''); setFilterSeniority(''); setFilterSize(''); setFilterSource(''); setFilterCountry(''); setSearch('') }}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          Limpar
        </button>

        <span className="ml-auto text-sm text-gray-500">{leads.length} leads</span>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2">
          <span className="text-sm text-gray-300">{selected.length} selecionados</span>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => handleBulkStatus(s)} className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600">
              → {STATUS_CONFIG[s].label}
            </button>
          ))}
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-500 hover:text-gray-300">Cancelar</button>
        </div>
      )}

      {error && <div className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="flex-1 overflow-auto rounded-lg border border-gray-800">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-gray-500">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left w-8">
                  <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? leads.map((l) => l.id) : [])} className="accent-blue-500" />
                </th>
                <th className="px-4 py-2 text-left">Pessoa</th>
                <th className="px-4 py-2 text-left">Empresa</th>
                <th className="px-4 py-2 text-left">Localização</th>
                <th className="px-4 py-2 text-left">Fonte</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">BANT</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-600">
                    Nenhum lead no pipeline. Use a <strong className="text-gray-500">Prospecção</strong> para encontrar e salvar contatos.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const location = [lead.city, lead.state, lead.country].filter(Boolean).join(', ')
                  return (
                    <tr key={lead.id} className={`border-b border-gray-800 transition hover:bg-gray-800/40 ${selected.includes(lead.id) ? 'bg-blue-900/10' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="accent-blue-500" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.photo_url ? (
                            <img src={lead.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-300">
                              {(lead.name || lead.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{lead.name || '—'}</div>
                            <div className="text-xs text-gray-500">{lead.email}</div>
                            {lead.role && <div className="text-xs text-gray-400">{lead.role}{lead.seniority ? ` · ${lead.seniority}` : ''}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-200">{lead.company}</div>
                        {lead.industry && <div className="text-xs text-gray-500">{lead.industry}</div>}
                        {lead.company_size && <div className="text-xs text-gray-600">{lead.company_size} pessoas</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{location || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{lead.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:outline-none"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center"><BantScore score={lead.bant_score} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.linkedin_url && (
                            <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">LI</a>
                          )}
                          <button onClick={() => handleDelete(lead.id)} className="text-xs text-red-500 hover:text-red-400">✕</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
