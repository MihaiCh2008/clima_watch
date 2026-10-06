import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const { t } = useLanguage()

  const navItems = [
    { to: '/problem', label: t.nav.problem, end: false },
    { to: '/solution', label: t.nav.solution, end: false },
    { to: '/', label: t.nav.live, end: true },
    { to: '/profile', label: t.nav.profile, end: false },
  ]

  return (
    <header className="relative z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md mb-10">
      <div className="max-w-3xl mx-auto py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="text-3xl leading-none">🌍</span>
            <span className="leading-tight">
              <span className="block text-xl sm:text-2xl font-extrabold heading-font text-[var(--text)]">ClimaWatch</span>
              <span className="block text-[11px] sm:text-xs label-mono uppercase tracking-wide text-[var(--text-soft)]">{t.nav.tagline}</span>
            </span>
          </NavLink>
          <LanguageSwitcher />
        </div>

        <nav className="flex gap-1 mt-4 pt-3 border-t border-[var(--border)] flex-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? 'text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-soft)]/40'
                    : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)] hover:bg-[var(--bg-card)]'
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
