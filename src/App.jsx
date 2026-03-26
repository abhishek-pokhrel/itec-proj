import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './state/appState'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Simple auth check - replace with real auth later
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppProvider>
                <Dashboard />
              </AppProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App
