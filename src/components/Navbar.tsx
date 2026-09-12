import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const { t } = useLanguage()

  const navItems = [
    { to: '/problema', label: t.nav.problem, end: false },
    { to: '/solutie', label: t.nav.solution, end: false },
    { to: '/', label: t.nav.live, end: true },
    { to: '/profil', label: t.nav.profile, end: false },
  ]

  return (
    <header className="relative z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-white/10 bg-[#05070f]/85 backdrop-blur-md mb-10">
      <div className="max-w-2xl mx-auto py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="text-3xl leading-none">🌍</span>
            <span className="leading-tight">
              <span className="block text-xl sm:text-2xl font-extrabold heading-font text-white">ClimaWatch</span>
              <span className="block text-[11px] sm:text-xs text-slate-500">{t.nav.tagline}</span>
            </span>
          </NavLink>
          <LanguageSwitcher />
        </div>

        <nav className="flex gap-1 mt-4 pt-3 border-t border-white/5 flex-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? 'text-sky-300 border-sky-400 bg-white/[0.04]'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
