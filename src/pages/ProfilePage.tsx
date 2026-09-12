import { useProfile } from '../hooks/useProfile'
import { SideNote } from '../components/SideNote'
import { useLanguage } from '../i18n/LanguageContext'
import type { UserProfile } from '../types/airQuality'

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-start justify-between gap-4 glass-card rounded-lg p-5 cursor-pointer">
      <div>
        <p className="font-bold heading-font text-white">{label}</p>
        <p className="text-slate-400 text-sm mt-1">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 accent-sky-400 shrink-0"
      />
    </label>
  )
}

export function ProfilePage() {
  const { t } = useLanguage()
  const { profile, setProfile } = useProfile()

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto relative">
        <SideNote
          n={1}
          text={t.profile.sideNote1}
          source={t.profile.sideNote1Source}
          wrapperClassName="top-16 right-full mr-10"
          accent="bg-blue-400/70"
        />

        <p className="text-slate-400 text-center mb-10 text-base sm:text-lg heading-font">{t.profile.subtitle}</p>

        <div className="space-y-4">
          <ToggleRow
            label={t.profile.toggle1Label}
            description={t.profile.toggle1Desc}
            checked={profile.hasRespiratoryIssue}
            onChange={(v) => update('hasRespiratoryIssue', v)}
          />
          <ToggleRow
            label={t.profile.toggle2Label}
            description={t.profile.toggle2Desc}
            checked={profile.hasYoungChild}
            onChange={(v) => update('hasYoungChild', v)}
          />
          <ToggleRow
            label={t.profile.toggle3Label}
            description={t.profile.toggle3Desc}
            checked={profile.exercisesOutdoors}
            onChange={(v) => update('exercisesOutdoors', v)}
          />
          <ToggleRow
            label={t.profile.toggle4Label}
            description={t.profile.toggle4Desc}
            checked={profile.wantsCarbonTips}
            onChange={(v) => update('wantsCarbonTips', v)}
          />
        </div>

        {profile.wantsCarbonTips && (
          <div className="mt-4 glass-card rounded-lg p-5 border-l-4 border-teal-400/70">
            <p className="font-bold heading-font text-teal-300 mb-1">{t.profile.carbonTipTitle}</p>
            <p className="text-slate-300 text-sm">{t.profile.carbonTipText}</p>
          </div>
        )}

        <div className="mt-6 glass-card rounded-lg p-5 text-sm text-sky-200">{t.profile.footerNote}</div>
      </div>
    </div>
  )
}
