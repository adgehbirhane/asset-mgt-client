import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material'
import {
  Search,
  FilterList,
  RequestPage,
  Inventory,
  CalendarToday,
  ConfirmationNumber,
  Laptop,
  Phone,
  Monitor,
  Tablet,
  Computer,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { apiService } from '@/services/api'
import { Asset, Category, AssetStatus } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'

const Assets: React.FC = () => {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const queryClient = useQueryClient()
  const pageSize = 12

  // Fetch assets with filters - simplified like Categories.tsx
  const { data: assetsData, isLoading, error } = useQuery({
    queryKey: ['assets', page, searchTerm, categoryFilter, statusFilter],
    queryFn: () =>
      apiService.getAssets({
        page,
        pageSize,
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
  })

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories({ pageSize: 100 })
  })

  // Request asset mutation
  const requestAssetMutation = useMutation({
    mutationFn: (assetId: string) => apiService.createAssetRequest({ assetId }),
    onSuccess: () => {
      setSnackbarMessage('Asset request submitted successfully!')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setRequestDialogOpen(false)
      setSelectedAsset(null)
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
    },
    onError: (error: any) => {
      setSnackbarMessage(error.response?.data?.message || 'Failed to submit request')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    },
  })

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value)
    setPage(1)
  }

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleRequestAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setRequestDialogOpen(true)
  }

  const confirmRequest = () => {
    if (selectedAsset) {
      requestAssetMutation.mutate(selectedAsset.id)
    }
  }

  const getStatusColor = (status: AssetStatus) => {
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

  const getCategoryIcon = (category: Category) => {
    switch (category.name) {
      case 'Laptop':
        return <Laptop />
      case 'Phone':
        return <Phone />
      case 'Monitor':
        return <Monitor />
      case 'Tablet':
        return <Tablet />
      case 'Desktop':
        return <Computer />
      default:
        return <CategoryIcon />
    }
  }

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
        Failed to load assets. Please try again.
      </Alert>
    )
  }

  const assets = assetsData?.data || []
  const totalPages = assetsData?.totalPages || 1

  return (
    <Box>
        <Typography variant="h4" component="h1" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory color="primary" />
        Available Assets
        </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search assets"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoriesData?.data?.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
                setStatusFilter('')
                setPage(1)
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(asset.imageUrl)}
                    alt={asset.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        {asset.name}
                      </Typography>
                      <Typography variant="h5" component="span">
                        {getCategoryIcon(asset.category)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {asset.category.name}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <ConfirmationNumber sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {asset.serialNumber}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status as AssetStatus)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      
                      {asset.status === 'Available' && (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<RequestPage />}
                          onClick={() => handleRequestAsset(asset)}
                          disabled={requestAssetMutation.isPending}
                        >
                          Request Asset
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={4}>
          <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      )}

      {/* Request Confirmation Dialog */}
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
        <DialogTitle>Request Asset</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to request the following asset?
              </Typography>
              <Card sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6">{selectedAsset.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAsset.category.name} • {selectedAsset.serialNumber}
                </Typography>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmRequest}
            variant="contained"
            disabled={requestAssetMutation.isPending}
          >
            {requestAssetMutation.isPending ? 'Submitting...' : 'Confirm Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Assets
