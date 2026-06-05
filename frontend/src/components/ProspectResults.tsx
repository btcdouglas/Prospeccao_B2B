'use client'

import { useState } from 'react'
import type { ProspectResult, ProspectSearchResponse } from '@/types/lead'
import { prospectsApi } from '@/lib/api'

interface Props {
  data: ProspectSearchResponse | null
  loading: boolean
  onPageChange: (page: number) => void
  onSaved: () => void
}

function EmailBadge({ status }: { status?: string }) {
  if (!status) return null
  const colors: Record<string, string> = {
    verified: 'bg-green-900/50 text-green-300',
    likely: 'bg-yellow-900/50 text-yellow-300',
    unverified: 'bg-gray-700 text-gray-400',
    invalid: 'bg-red-900/50 text-red-400',
  }
  return (
    <span className={`ml-1 rounded px-1 py-0.5 text-[10px] font-medium ${colors[status] ?? colors.unverified}`}>
      {status}
    </span>
  )
}

function ProspectRow({ prospect, onSave }: { prospect: ProspectResult; onSave: (p: ProspectResult) => void }) {
  const location = [prospect.city, prospect.state, prospect.country].filter(Boolean).join(', ')

  return (
    <tr className="border-b border-gray-800 transition hover:bg-gray-800/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {prospect.photo_url ? (
            <img src={prospect.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-blue-200">
              {(prospect.name || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-white">{prospect.name || '—'}</div>
            {prospect.linkedin_url && (
              <a href={prospect.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-300">{prospect.role || '—'}</div>
        {prospect.seniority && <div className="text-xs text-gray-500">{prospect.seniority}</div>}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-gray-200">{prospect.company || '—'}</div>
        {prospect.industry && <div className="text-xs text-gray-500">{prospect.industry}</div>}
        {prospect.company_size && <div className="text-xs text-gray-600">{prospect.company_size} pessoas</div>}
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">{location || '—'}</td>
      <td className="px-4 py-3">
        {prospect.email ? (
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-mono text-xs">{prospect.email}</span>
            <EmailBadge status={prospect.email_status} />
          </div>
        ) : (
          <span className="text-xs text-gray-600">sem email</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {prospect.already_saved ? (
          <span className="rounded px-2 py-1 text-xs text-gray-500">Salvo</span>
        ) : (
          <button
            onClick={() => onSave(prospect)}
            disabled={!prospect.email}
            className="rounded bg-blue-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            title={!prospect.email ? 'Sem email para salvar' : 'Salvar no pipeline'}
          >
            + Pipeline
          </button>
        )}
      </td>
    </tr>
  )
}

export default function ProspectResults({ data, loading, onPageChange, onSaved }: Props) {
  const [saving, setSaving] = useState<string | null>(null)
  const [selected, setSelected] = useState<ProspectResult[]>([])

  const handleSave = async (prospect: ProspectResult) => {
    const key = prospect.apollo_id ?? prospect.email ?? ''
    setSaving(key)
    try {
      await prospectsApi.save(prospect)
      prospect.already_saved = true
      onSaved()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      alert(msg ?? 'Erro ao salvar prospect')
    } finally {
      setSaving(null)
    }
  }

  const handleSaveSelected = async () => {
    if (!selected.length) return
    setSaving('bulk')
    try {
      await prospectsApi.saveBulk(selected.filter((p) => p.email && !p.already_saved))
      onSaved()
      setSelected([])
    } finally {
      setSaving(null)
    }
  }

  const toggleSelect = (p: ProspectResult) => {
    const key = p.apollo_id ?? p.email ?? ''
    setSelected((prev) =>
      prev.some((x) => (x.apollo_id ?? x.email) === key) ? prev.filter((x) => (x.apollo_id ?? x.email) !== key) : [...prev, p]
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-400">Buscando prospects...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
        <div className="text-5xl">🔍</div>
        <p className="text-base">Configure os filtros e clique em <strong className="text-gray-300">Buscar prospects</strong></p>
        <p className="text-sm text-gray-600">Sem chave Apollo configurada, modo demo estará ativo.</p>
      </div>
    )
  }

  if (data.results.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Nenhum prospect encontrado com esses filtros.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <span className="text-sm text-gray-400">
          {data.total} prospect{data.total !== 1 ? 's' : ''} encontrado{data.total !== 1 ? 's' : ''}
        </span>
        {selected.length > 0 && (
          <button
            onClick={handleSaveSelected}
            disabled={saving === 'bulk'}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving === 'bulk' ? 'Salvando...' : `Salvar ${selected.length} selecionados`}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">Pessoa</th>
              <th className="px-4 py-2 text-left">Cargo</th>
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-left">Localização</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((p, i) => (
              <ProspectRow key={p.apollo_id ?? p.email ?? i} prospect={p} onSave={handleSave} />
            ))}
          </tbody>
        </table>
      </div>

      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-800 py-3">
          <button
            disabled={data.page <= 1}
            onClick={() => onPageChange(data.page - 1)}
            className="rounded px-3 py-1 text-sm text-gray-400 hover:bg-gray-800 disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {data.page} de {data.total_pages}
          </span>
          <button
            disabled={data.page >= data.total_pages}
            onClick={() => onPageChange(data.page + 1)}
            className="rounded px-3 py-1 text-sm text-gray-400 hover:bg-gray-800 disabled:opacity-30"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
