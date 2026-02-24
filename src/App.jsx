import './App.css'
import Dashboard from './pages/Dashboard'
import { AppProvider } from './state/appState'

function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}

export default App
