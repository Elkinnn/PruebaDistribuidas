import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AdminDashboard from './pages/admin/Dashboard'
import MedicoDashboard from './pages/medico/Dashboard'
import Login from './pages/Login'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/medico/*" element={<MedicoDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App
