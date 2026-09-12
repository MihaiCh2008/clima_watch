import { Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuroraBackground } from './components/AuroraBackground'
import { PageBackground, type BackgroundVariant } from './components/PageBackground'
import { LanguageProvider } from './i18n/LanguageContext'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { ProblemPage } from './pages/ProblemPage'
import { SolutionPage } from './pages/SolutionPage'

function backgroundForRoute(pathname: string): BackgroundVariant {
  if (pathname === '/problema') return 'factory'
  if (pathname === '/solutie') return 'mountain'
  return 'planet'
}

function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#05070f] text-white p-4 sm:p-6 relative z-0 overflow-x-hidden">
      <AuroraBackground />
      <PageBackground variant={backgroundForRoute(location.pathname)} />
      <Navbar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problema" element={<ProblemPage />} />
          <Route path="/solutie" element={<SolutionPage />} />
          <Route path="/profil" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  )
}

export default App
