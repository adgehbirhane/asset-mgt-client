import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import { ArrowBack, Assignment, Build, CheckCircle, Cancel } from '@mui/icons-material'
import { apiService } from '@/services/api'

const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => apiService.getAsset(id!),
    enabled: !!id
  })

  const requestMutation = useMutation({
    mutationFn: (assetId: string) => apiService.createAssetRequest({ assetId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
      // Show success message
    },
    onError: (error: any) => {
      console.error('Failed to request asset:', error)
    }
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data?.data) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load asset details. Please try again.
      </Alert>
    )
  }

  const asset = data.data

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <CheckCircle />
      case 'Assigned':
        return <Assignment />
      case 'Maintenance':
        return <Build />
      case 'Retired':
        return <Cancel />
      default:
        return <CheckCircle />
    }
  }

  const handleRequestAsset = () => {
    requestMutation.mutate(asset.id)
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/assets')}
        sx={{ mb: 3 }}
      >
        Back to Assets
      </Button>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Typography variant="h4" component="h1">
              {asset.name}
            </Typography>
            <Chip
              icon={getStatusIcon(asset.status)}
              label={asset.status}
              color={getStatusColor(asset.status) as any}
              sx={{ mb: 3 }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Asset Information
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {asset.category.name}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Serial Number
                </Typography>
                <Typography variant="body1">
                  {asset.serialNumber}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Purchase Date
                </Typography>
                <Typography variant="body1">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Assignment Information
              </Typography>
              {asset.assignedTo ? (
                <>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Assigned To
                    </Typography>
                    <Typography variant="body1">
                      {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Assigned Date
                    </Typography>
                    <Typography variant="body1">
                      {asset.assignedAt ? new Date(asset.assignedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Not currently assigned
                </Typography>
              )}
            </Grid>
          </Grid>

          {asset.status === 'Available' && (
            <Box mt={3}>
              <Button
                variant="contained"
                size="large"
                onClick={handleRequestAsset}
                disabled={requestMutation.isPending}
              >
                {requestMutation.isPending ? 'Requesting...' : 'Request Asset'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AssetDetails
