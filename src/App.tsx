import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/contexts/AuthContext'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import LoginPage from '@/features/auth/pages/LoginPage'
import Dashboard from '@/features/dashboard/pages/Dashboard'
import NPDProjects from '@/features/npd/pages/NPDProjects'
import NPDCategoryProjects from '@/features/npd/pages/NPDCategoryProjects'
import NPDProjectDetail from '@/features/npd/pages/NPDProjectDetail'
import VAVEProjects from '@/features/vave/pages/VAVEProjects'
import StandardizationProjects from '@/features/standardization/pages/StandardizationProjects'
import ProjectWorkspace from '@/features/common/pages/ProjectWorkspace'
import DevConsole from '@/devtools/DevConsole'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/npd"
              element={
                <AuthGuard>
                  <NPDProjects />
                </AuthGuard>
              }
            />
            <Route
              path="/npd/:categoryId"
              element={
                <AuthGuard>
                  <NPDCategoryProjects />
                </AuthGuard>
              }
            />
            <Route
              path="/npd/project/:projectId"
              element={
                <AuthGuard>
                  <NPDProjectDetail />
                </AuthGuard>
              }
            />
            <Route
              path="/vave"
              element={
                <AuthGuard>
                  <VAVEProjects />
                </AuthGuard>
              }
            />
            <Route
              path="/standardization"
              element={
                <AuthGuard>
                  <StandardizationProjects />
                </AuthGuard>
              }
            />
            <Route
              path="/workspace/:moduleType/:projectId"
              element={
                <AuthGuard>
                  <ProjectWorkspace />
                </AuthGuard>
              }
            />
          </Routes>

          {/* Developer Testing Console — dev mode only */}
          <DevConsole />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App