'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/prospects', label: 'Prospecção' },
  { href: '/pipeline', label: 'Pipeline' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-800 bg-gray-900 px-6 py-0">
      <div className="flex items-center gap-8">
        <span className="py-4 text-sm font-bold tracking-wide text-white">SDR AI</span>
        <div className="flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
