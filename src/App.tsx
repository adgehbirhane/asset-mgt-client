import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

// Layout components
import Layout from '@/components/Layout/Layout'

// Public pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Protected pages
import Dashboard from '@/pages/Dashboard'
import Assets from '@/pages/Assets'
import AssetDetails from '@/pages/AssetDetails'
import AssetRequests from '@/pages/AssetRequests'
import Profile from '@/pages/Profile'

// Admin pages
import AdminAssets from '@/pages/Admin/Assets'
import AdminAssetForm from '@/pages/Admin/assets/AssetForm'
import AdminRequests from '@/pages/Admin/Requests'
import AdminUsers from '@/pages/Admin/Users'
import Categories from '@/pages/Admin/Categories'

// Components
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/:id" element={<AssetDetails />} />
        <Route path="requests" element={<AssetRequests />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin routes */}
        <Route path="admin">
          <Route
            path="assets"
            element={
              <AdminRoute>
                <AdminAssets />
              </AdminRoute>
            }
          />
          <Route
            path="assets/new"
            element={
              <AdminRoute>
                <AdminAssetForm />
              </AdminRoute>
            }
          />
          <Route
            path="assets/:id/edit"
            element={
              <AdminRoute>
                <AdminAssetForm />
              </AdminRoute>
            }
          />
          <Route
            path="requests"
            element={
              <AdminRoute>
                <AdminRequests />
              </AdminRoute>
            }
          />
          <Route
            path="users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="categories"
            element={
              <AdminRoute>
                <Categories />
              </AdminRoute>
            }
          />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
