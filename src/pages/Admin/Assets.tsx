import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Pagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  QrCode as SerialNumberIcon,
} from '@mui/icons-material'
import { apiService } from '@/services/api'
import { Asset } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/utils/imageUtils'
import AssetActions from './assets/AssetActions'
import AssetStatusSelector from './assets/AssetStatusSelector'
import AssetViewDialog from './assets/AssetViewDialog'
import AssetFormDialog from './assets/AssetFormDialog'
import { formatDate } from '@/utils/dateformat'

// Main Admin Assets Component
const AdminAssets: React.FC = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()

  // State management
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // Dialog states
  const [assetFormOpen, setAssetFormOpen] = useState(false)
  const [assetViewOpen, setAssetViewOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)

  // Authentication check
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">
          You are not authenticated. Please log in.
        </Alert>
      </Box>
    )
  }

  if (user?.role !== 'Admin') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">
          You do not have admin privileges to access this page.
        </Alert>
      </Box>
    )
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Queries
  const {
    data: assetsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assets', debouncedSearchTerm, statusFilter, categoryFilter, page, pageSize],
    queryFn: () =>
      apiService.getAssets({
        page,
        pageSize,
        search: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      }),
    placeholderData: (previousData) => previousData,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories({ pageSize: 100 })
  })

  // Mutations
  const createAssetMutation = useMutation({
    mutationFn: (data: any) => apiService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSnackbar({ open: true, message: 'Asset created successfully!', severity: 'success' })
      setAssetFormOpen(false)
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create asset',
        severity: 'error'
      })
    },
  })

  const updateAssetMutation = useMutation({
    mutationFn: (data: any) => apiService.updateAsset(editingAsset!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSnackbar({ open: true, message: 'Asset updated successfully!', severity: 'success' })
      setAssetFormOpen(false)
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update asset',
        severity: 'error'
      })
    },
  })

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: string) => apiService.deleteAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSnackbar({ open: true, message: 'Asset deleted successfully!', severity: 'success' })
      setDeleteDialogOpen(false)
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete asset',
        severity: 'error'
      })
    },
  })

  const updateAssetStatusMutation = useMutation({
    mutationFn: ({ assetId, status }: { assetId: string; status: string }) =>
      apiService.updateAssetStatus(assetId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSnackbar({ open: true, message: 'Asset status updated successfully!', severity: 'success' })
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update asset status',
        severity: 'error'
      })
    },
  })

  // Event handlers
  const handleOpenAssetForm = (asset?: Asset) => {
    setEditingAsset(asset || null)
    setAssetFormOpen(true)
  }

  const handleCloseAssetForm = () => {
    setAssetFormOpen(false)
    setEditingAsset(null)
  }

  const handleOpenAssetView = (asset: Asset) => {
    setViewingAsset(asset)
    setAssetViewOpen(true)
  }

  const handleCloseAssetView = () => {
    setAssetViewOpen(false)
    setViewingAsset(null)
  }

  const handleOpenDeleteDialog = (asset: Asset) => {
    setAssetToDelete(asset)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setAssetToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      deleteAssetMutation.mutate(assetToDelete.id)
    }
  }

  const handleAssetSubmit = (data: any) => {
    if (editingAsset) {
      updateAssetMutation.mutate(data)
    } else {
      createAssetMutation.mutate(data)
    }
  }

  const handleStatusChange = (assetId: string, newStatus: string) => {
    updateAssetStatusMutation.mutate({ assetId, status: newStatus })
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value)
    setPage(1)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setCategoryFilter('')
    setPage(1)
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load assets. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    )
  }

  const assets = assetsData?.data || []
  const totalPages = assetsData?.totalPages || 1

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="primary" />
          Manage Assets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAssetForm()}
          size="large"
        >
          Add Asset
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon color="primary" />
            Filters & Search
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Search assets"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, serial number..."
                fullWidth
                size="medium"
                variant="outlined"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Retired">Retired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel>Category Filter</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  label="Category Filter"
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
            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                color='secondary'
                onClick={handleClearFilters}
                startIcon={<FilterListIcon />}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Asset Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Serial Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Purchase Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <TableRow key={asset.id} hover sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={asset.imageUrl ? getImageUrl(asset.imageUrl) : undefined}
                          variant="rounded"
                          sx={{ width: 32, height: 32 }}
                        >
                          <InventoryIcon color="action" sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {asset.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {asset.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asset.category.name}
                        size="small"
                        variant="outlined"
                        icon={<CategoryIcon />}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SerialNumberIcon color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                          {asset.serialNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <AssetStatusSelector
                        asset={asset}
                        onStatusChange={handleStatusChange}
                        isPending={updateAssetStatusMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(asset.purchaseDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {asset.assignedTo ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon color="warning" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="warning.main" fontWeight="500">
                            {typeof asset.assignedTo === 'object' && asset.assignedTo !== null && 'firstName' in asset.assignedTo ?
                              `${(asset.assignedTo as any).firstName} ${(asset.assignedTo as any).lastName}` :
                              String(asset.assignedTo)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <AssetActions
                        asset={asset}
                        onView={handleOpenAssetView}
                        onEdit={handleOpenAssetForm}
                        onDelete={handleOpenDeleteDialog}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No assets found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria or add a new asset
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Asset Form Dialog */}
      <AssetFormDialog
        open={assetFormOpen}
        onClose={handleCloseAssetForm}
        asset={editingAsset || undefined}
        categories={categoriesData?.data || []}
        onSubmit={handleAssetSubmit}
        isPending={createAssetMutation.isPending || updateAssetMutation.isPending}
      />

      {/* Asset View Dialog */}
      <AssetViewDialog
        open={assetViewOpen}
        onClose={handleCloseAssetView}
        asset={viewingAsset}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {assetToDelete && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete the following asset?
              </Typography>
              <Card sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6">{assetToDelete.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {assetToDelete.category.name} • {assetToDelete.serialNumber}
                </Typography>
              </Card>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteAssetMutation.isPending}
          >
            {deleteAssetMutation.isPending ? 'Deleting...' : 'Delete Asset'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminAssets
