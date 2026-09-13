import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'
import Results from './pages/Results'
import LandscapeNew from './pages/LandscapeNew'
import LandscapeResults from './pages/LandscapeResults'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/new-project" element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        } />
        <Route path="/results/:id" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/landscape/new" element={
          <ProtectedRoute>
            <LandscapeNew />
          </ProtectedRoute>
        } />
        <Route path="/landscape/results/:id" element={
          <ProtectedRoute>
            <LandscapeResults />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}