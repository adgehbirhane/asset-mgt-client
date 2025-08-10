import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Inventory,
  Assignment,
  CheckCircle,
  Pending,
  Add,
  TrendingUp,
  TrendingDown,
  Approval,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch assets data
  const { data: assetsData, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ['assets'],
    queryFn: () => apiService.getAssets({ pageSize: 100 })
  })

  // Fetch asset requests data
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['asset-requests'],
    queryFn: () => apiService.getAssetRequests({ pageSize: 100 })
  })

  const isLoading = assetsLoading || requestsLoading
  const error = assetsError || requestsError

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please try again.
      </Alert>
    )
  }

  const assets = assetsData?.data || []
  const requests = requestsData?.data || []

  // Calculate statistics
  const totalAssets = assets.length
  const availableAssets = assets.filter(asset => asset.status === 'Available').length
  const assignedAssets = assets.filter(asset => asset.status === 'Assigned').length
  const pendingRequests = requests.filter(request => request.status === 'Pending').length
  const approvedRequests = requests.filter(request => request.status === 'Approved').length

  // Get recent requests
  const recentRequests = requests
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5)

  // Get recent assets
  const recentAssets = assets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const StatCard: React.FC<{
    title: string
    value: number
    icon: React.ReactNode
    color: string
    trend?: 'up' | 'down'
  }> = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }} >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend === 'up' ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
            )}
            <Typography variant="caption" color="textSecondary">
              {trend === 'up' ? 'Increasing' : 'Decreasing'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success'
      case 'Assigned':
        return 'warning'
      case 'Maintenance':
        return 'info'
      case 'Retired':
        return 'error'
      default:
        return 'default'
    }
  }

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <Dashboard />
          Dashboard
        </Typography>
        {user?.role === 'Admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/assets/new')}
          >
            Add Asset
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Total Assets"
            value={totalAssets}
            icon={<Inventory sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Available Assets"
            value={availableAssets}
            icon={<CheckCircle sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Assigned Assets"
            value={assignedAssets}
            icon={<Assignment sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            icon={<Pending sx={{ color: 'white' }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Pending Requests"
            value={approvedRequests}
            icon={<Approval sx={{ color: 'white' }} />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Asset Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Asset Requests</Typography>
              <Button size="small" onClick={() => navigate('/requests')}>
                View All
              </Button>
            </Box>
            {recentRequests.length > 0 ? (
              <List>
                {recentRequests.map((request) => (
                  <ListItem key={request.id} divider>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary={request.asset.name}
                      secondary={`${request.user.firstName} ${request.user.lastName} • ${new Date(
                        request.requestedAt
                      ).toLocaleDateString()}`}
                    />
                    <Chip
                      label={request.status}
                      color={getRequestStatusColor(request.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" py={2}>
                No recent requests
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Assets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Assets</Typography>
              <Button size="small" onClick={() => navigate('/assets')}>
                View All
              </Button>
            </Box>
            {recentAssets.length > 0 ? (
              <List>
                {recentAssets.map((asset) => (
                  <ListItem key={asset.id} divider>
                    <ListItemIcon>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText
                      primary={asset.name}
                      secondary={`${asset.category.name} • ${new Date(asset.createdAt).toLocaleDateString()}`}
                    />
                    <Chip
                      label={asset.status}
                      color={getStatusColor(asset.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" align="center" py={2}>
                No recent assets
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
