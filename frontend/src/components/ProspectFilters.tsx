'use client'

import { useState } from 'react'
import type { ProspectFilter } from '@/types/lead'

const SENIORITIES = ['C-Level', 'VP', 'Director', 'Manager', 'Senior', 'Entry', 'Owner', 'Founder']

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+']

const INDUSTRIES = [
  'Fintech',
  'SaaS',
  'Health Technology',
  'Education Technology',
  'Agriculture Technology',
  'Cloud Computing',
  'Real Estate Technology',
  'Legal Technology',
  'Logistics Technology',
  'Retail Technology',
  'Cybersecurity',
  'Artificial Intelligence',
  'E-commerce',
  'Information Technology',
]

const COUNTRIES = ['Brazil', 'United States', 'Argentina', 'Colombia', 'Mexico', 'Chile', 'Portugal']

interface Props {
  onSearch: (filters: ProspectFilter) => void
  loading: boolean
}

function TagInput({ label, placeholder, values, onChange }: {
  label: string
  placeholder: string
  values: string[]
  onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">{label}</label>
      <div className="flex gap-1">
        <input
          className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <button onClick={add} className="rounded bg-gray-700 px-2 text-gray-300 hover:bg-gray-600">+</button>
      </div>
      {values.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-200">
              {v}
              <button onClick={() => onChange(values.filter((x) => x !== v))} className="text-blue-400 hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CheckGroup({ label, options, values, onChange }: {
  label: string
  options: string[]
  values: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt])

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">{label}</label>
      <div className="space-y-1">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300 hover:text-white">
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
              className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-700 accent-blue-500"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function ProspectFilters({ onSearch, loading }: Props) {
  const [keywords, setKeywords] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [seniorities, setSeniorities] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [companySizes, setCompanySizes] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])

  const handleSearch = () => {
    onSearch({
      keywords: keywords || undefined,
      titles,
      seniorities,
      countries,
      locations,
      industries,
      company_sizes: companySizes,
      technologies,
      page: 1,
    })
  }

  const handleReset = () => {
    setKeywords('')
    setTitles([])
    setSeniorities([])
    setCountries([])
    setLocations([])
    setIndustries([])
    setCompanySizes([])
    setTechnologies([])
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Filtros</h2>
        <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300">Limpar</button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-400">Busca livre</label>
        <input
          className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          placeholder="nome, empresa, email..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <TagInput label="Cargo / Título" placeholder="ex: CTO, VP Engineering" values={titles} onChange={setTitles} />

      <CheckGroup label="Senioridade" options={SENIORITIES} values={seniorities} onChange={setSeniorities} />

      <CheckGroup label="País" options={COUNTRIES} values={countries} onChange={setCountries} />

      <TagInput label="Cidade / Estado" placeholder="ex: São Paulo, SP" values={locations} onChange={setLocations} />

      <CheckGroup label="Indústria" options={INDUSTRIES} values={industries} onChange={setIndustries} />

      <CheckGroup label="Tamanho da empresa" options={COMPANY_SIZES} values={companySizes} onChange={setCompanySizes} />

      <TagInput label="Tecnologias" placeholder="ex: React, Kubernetes" values={technologies} onChange={setTechnologies} />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="mt-auto w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Buscando...' : 'Buscar prospects'}
      </button>
    </aside>
  )
}
