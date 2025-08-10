import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Pagination,
  Avatar,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardContent,
  Paper
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers'
import { apiService } from '@/services/api'
import { AssetRequest } from '@/types'
import { formatDate } from '@/utils/dateformat'

const AdminRequests: React.FC = () => {
  const queryClient = useQueryClient()

  // State for filters
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [requestedDateFrom, setRequestedDateFrom] = useState<Date | null>(null)
  const [requestedDateTo, setRequestedDateTo] = useState<Date | null>(null)
  const [processedDateFrom, setProcessedDateFrom] = useState<Date | null>(null)
  const [processedDateTo, setProcessedDateTo] = useState<Date | null>(null)

  // State for dialogs and actions
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch requests with filters
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['admin-asset-requests', debouncedSearchTerm, statusFilter, requestedDateFrom, requestedDateTo, processedDateFrom, processedDateTo, page, pageSize],
    queryFn: () => apiService.getAssetRequests({
      page,
      pageSize,
      search: debouncedSearchTerm || undefined,
      status: statusFilter || undefined,
      requestedFrom: requestedDateFrom?.toISOString() || undefined,
      requestedTo: requestedDateTo?.toISOString() || undefined,
      processedFrom: processedDateFrom?.toISOString() || undefined,
      processedTo: processedDateTo?.toISOString() || undefined
    }),
    placeholderData: (previousData) => previousData,
  })

  // Update request mutation
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.updateAssetRequest(id, { status }),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: `Request ${actionType}d successfully!`,
        severity: 'success'
      })
      setActionDialogOpen(false)
      setSelectedRequest(null)
      setActionType(null)
      queryClient.invalidateQueries({ queryKey: ['admin-asset-requests'] })
      queryClient.invalidateQueries({ queryKey: ['asset-requests'] })
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: `Failed to ${actionType} request: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      })
    },
  })

  // Handle pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  // Handle filter changes
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value)
    setPage(1)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setRequestedDateFrom(null)
    setRequestedDateTo(null)
    setProcessedDateFrom(null)
    setProcessedDateTo(null)
    setPage(1)
  }

  // Handle request actions
  const handleAction = (request: AssetRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(type)
    setActionDialogOpen(true)
  }

  const confirmAction = () => {
    if (selectedRequest && actionType) {
      const status = actionType === 'approve' ? 'Approved' : 'Rejected'
      updateRequestMutation.mutate({ id: selectedRequest.id, status })
    }
  }

  // Status display helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning'
      case 'Approved': return 'success'
      case 'Rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <PendingIcon />
      case 'Approved': return <CheckCircleIcon />
      case 'Rejected': return <CancelIcon />
      default: return <PendingIcon />
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load asset requests. Please try again.
          <br />
          Error details: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    )
  }

  const requests = requestsData?.data || []
  const totalPages = requestsData?.totalPages || 1

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          Asset Requests
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon color="primary" />
            Filters & Search
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Search requests"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by user, asset..."
                fullWidth
                size="medium"
                variant="outlined"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="medium">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={2}>
                <DatePicker
                  label="Requested From"
                  value={requestedDateFrom}
                  onChange={setRequestedDateFrom}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    },
                  }}
                />
                <DatePicker
                  label="Requested To"
                  value={requestedDateTo}
                  onChange={setRequestedDateTo}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                startIcon={<FilterListIcon />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Asset</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Requested</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Processed</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={request.user.profileImageUrl}
                          sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {request.user.firstName} {request.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InventoryIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {request.asset.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.asset.serialNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.asset.category.name}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(request.requestedAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {request.processedAt ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500">
                            {formatDate(request.processedAt)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === 'Pending' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAction(request, 'approve')}
                            disabled={updateRequestMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleAction(request, 'reject')}
                            disabled={updateRequestMutation.isPending}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No asset requests found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or check back later
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {actionType} the following request?
              </Typography>
              <Card sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6">{selectedRequest.asset.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Requested by: {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRequest.asset.category.name} • {selectedRequest.asset.serialNumber}
                </Typography>
              </Card>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={updateRequestMutation.isPending}
          >
            {updateRequestMutation.isPending ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
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

export default AdminRequests