import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Pagination,
  Card,
  Grid,
  Tooltip,
  DialogContentText,
  Stack,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';
import { CalendarIcon } from '@mui/x-date-pickers';
import { formatDate } from '@/utils/dateformat';

interface CategoryFormData {
  name: string;
  description: string;
}

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const queryClient = useQueryClient();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  // Fetch categories
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getAllCategories()
  });

  // Filter and paginate categories on the client side
  const filteredCategories = useMemo(() => {
    if (!categoriesData?.data) return [];

    return categoriesData.data.filter(category => {
      const matchesSearch = searchTerm
        ? category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus = statusFilter
        ? category.status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [categoriesData, searchTerm, statusFilter]);

  // Paginated categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (page - 1) * 10;
    return filteredCategories.slice(startIndex, startIndex + 10);
  }, [filteredCategories, page]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCategories.length / 10);
  }, [filteredCategories]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalCategories = filteredCategories.length;
    const activeCategories = filteredCategories.filter(c => c.status === 'ACTIVE').length;
    const inactiveCategories = filteredCategories.filter(c => c.status === 'INACTIVE').length;
    const totalAssets = filteredCategories.reduce((sum, c) => sum + (c.assetsCount ?? 0), 0);

    return { totalCategories, activeCategories, inactiveCategories, totalAssets };
  }, [filteredCategories]);

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => apiService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create category',
        severity: 'error'
      });
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryDto) => apiService.updateCategory(editingCategory!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update category',
        severity: 'error'
      });
    }
  });

  // Update category status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (id: string) => apiService.updateCategoryStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category status updated successfully!', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update category status',
        severity: 'error'
      });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
      setDeleteDialog({ open: false, category: null });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete category',
        severity: 'error'
      });
    }
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('description', category.description);
    } else {
      setEditingCategory(null);
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    reset();
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setDeleteDialog({ open: true, category });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, category: null });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.category) {
      deleteMutation.mutate(deleteDialog.category.id);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStatusToggle = (category: Category) => {
    updateStatusMutation.mutate(category.id);
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading categories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load categories. Please try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="primary" />
          Manage Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add Category
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Search categories"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name or description..."
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status Filter"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              color="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Categories Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assets Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.status}
                        color={category.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                        icon={category.status === 'ACTIVE' ? <CheckCircleIcon /> : <CancelIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {category.assetsCount ?? 0}
                        </Typography>
                        <InventoryIcon color="action" sx={{ fontSize: 16 }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(category.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(category)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Toggle ${category.status === 'ACTIVE' ? 'Inactive' : 'Active'}`}>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusToggle(category)}
                            color={category.status === 'ACTIVE' ? 'warning' : 'success'}
                            disabled={updateStatusMutation.isPending}
                          >
                            {category.status === 'ACTIVE' ? <ToggleOffIcon /> : <ToggleOnIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(category)}
                            color="error"
                            disabled={(category.assetsCount ?? 0) > 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={4}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No categories found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria or add a new category
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                {...register('name', { required: 'Category name is required' })}
                label="Category Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                {...register('description', { required: 'Description is required' })}
                label="Description"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{deleteDialog.category?.name}"?
            {(deleteDialog.category?.assetsCount ?? 0) > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This category has {deleteDialog.category?.assetsCount ?? 0} associated asset(s) and cannot be deleted.
              </Alert>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending || (deleteDialog.category?.assetsCount ?? 0) > 0}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
  );
};

export default Categories;