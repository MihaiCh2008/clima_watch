import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { BreathingBackground } from './components/BreathingBackground'
import { Navbar } from './components/Navbar'
import { AirMoodProvider } from './context/AirMoodProvider'
import { LanguageProvider } from './i18n/LanguageContext'
import { ComparePage } from './pages/ComparePage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { ProblemPage } from './pages/ProblemPage'
import { SolutionPage } from './pages/SolutionPage'

// the research page ships the benchmark results, so it loads on demand
const ResearchPage = lazy(() => import('./pages/ResearchPage').then((m) => ({ default: m.ResearchPage })))

function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 sm:p-6 relative z-0 overflow-x-hidden">
      <BreathingBackground />
      <Navbar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problem" element={<ProblemPage />} />
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/research"
            element={
              <Suspense fallback={<div className="mx-auto h-96 max-w-3xl rounded-2xl skeleton-shimmer" />}>
                <ResearchPage />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AirMoodProvider>
        <AppShell />
      </AirMoodProvider>
    </LanguageProvider>
  )
}

export default App
