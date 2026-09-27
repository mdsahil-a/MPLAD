import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout.jsx'
import Login from '../pages/Login/Login.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import Projects from '../pages/Projects/Projects.jsx'
import ProjectDetail from '../pages/ProjectDetail/ProjectDetail.jsx'
import Alerts from '../pages/Alerts/Alerts.jsx'
import Reports from '../pages/Reports/Reports.jsx'
import Settings from '../pages/Settings/Settings.jsx'

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
