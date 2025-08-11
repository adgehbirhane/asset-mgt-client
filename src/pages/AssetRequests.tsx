import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  FilterAlt as FilterAltIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Phone as PhoneIcon,
  Tablet as TabletIcon,
  Monitor as MonitorIcon,
} from '@mui/icons-material';
import { apiService } from '@/services/api';
import { formatDate } from '@/utils/dateformat';
import { CalendarIcon } from '@mui/x-date-pickers';

// Utility function for category icons
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, JSX.Element> = {
    laptop: <ComputerIcon />,
    computer: <ComputerIcon />,
    phone: <PhoneIcon />,
    smartphone: <PhoneIcon />,
    tablet: <TabletIcon />,
    ipad: <TabletIcon />,
    monitor: <MonitorIcon />,
    display: <MonitorIcon />,
    screen: <MonitorIcon />,
  };

  const lowerCaseCategory = categoryName.toLowerCase();
  return iconMap[lowerCaseCategory] || <ComputerIcon />;
};

const AssetRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['asset-requests', page, searchTerm, statusFilter],
    queryFn: () =>
      apiService.getMYAssetRequests({
        page,
        pageSize: 10,
        query: searchTerm || undefined,
        status: statusFilter || undefined,
      }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'Pending':
        return <PendingIcon fontSize="small" />;
      case 'Rejected':
        return <CancelIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(1);
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load requests. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => refetch()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const requests = requestsData?.data || [];
  const totalPages = requestsData?.totalPages || 1;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          My Asset Requests
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Search requests"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by asset, user, or serial number..."
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status Filter"
                startAdornment={<FilterAltIcon color="action" sx={{ mr: 1 }} />}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth
              startIcon={<RefreshIcon />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Requests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Requested Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Processed Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Processed By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getCategoryIcon(request.asset.category.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {request.asset.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.asset.serialNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={request.user.profileImageUrl}
                          sx={{ bgcolor: 'secondary.main' }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {request.user.firstName} {request.user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(request.requestedAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {request.processedAt ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon color="action" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" fontWeight="500">
                            {formatDate(request.processedAt)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not processed
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.processedBy ? (
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={request.processedBy.profileImageUrl}
                            sx={{ width: 32, height: 32 }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Typography variant="body2">
                            {request.processedBy.firstName} {request.processedBy.lastName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
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
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewDetails(request)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No requests found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria
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

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Request Details
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Asset Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {getCategoryIcon(selectedRequest.asset.category.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{selectedRequest.asset.name}</Typography>
                    <Typography color="text.secondary">
                      {selectedRequest.asset.category.name}
                    </Typography>
                  </Box>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2">Details</Typography>
                  <Typography>
                    Serial: {selectedRequest.asset.serialNumber}
                  </Typography>
                  <Typography>
                    Purchase Date: {formatDate(selectedRequest.asset.purchaseDate)}
                  </Typography>
                  <Typography>
                    Status: {selectedRequest.asset.status}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Request Information
                </Typography>
                <Box mb={2}>
                  <Typography variant="subtitle2">Requested By</Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar src={selectedRequest.user.profileImageUrl} sx={{ width: 40, height: 40 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography>
                        {selectedRequest.user.firstName} {selectedRequest.user.lastName}
                      </Typography>
                      <Typography color="text.secondary">
                        {selectedRequest.user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box mb={2}>
                  <Typography variant="subtitle2">Dates</Typography>
                  <Typography>
                    Requested: {formatDate(selectedRequest.requestedAt)}
                  </Typography>
                  {selectedRequest.processedAt && (
                    <Typography>
                      Processed: {formatDate(selectedRequest.processedAt)}
                    </Typography>
                  )}
                </Box>
                {selectedRequest.processedBy && (
                  <Box mb={2}>
                    <Typography variant="subtitle2">Processed By</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={selectedRequest.processedBy.profileImageUrl} sx={{ width: 40, height: 40 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography>
                          {selectedRequest.processedBy.firstName} {selectedRequest.processedBy.lastName}
                        </Typography>
                        <Typography color="text.secondary">
                          {selectedRequest.processedBy.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedRequest.status)}
                    label={selectedRequest.status}
                    color={getStatusColor(selectedRequest.status)}
                    size="medium"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetRequests;