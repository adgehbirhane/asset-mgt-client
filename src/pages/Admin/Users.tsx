import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Grid,
  Button,
} from '@mui/material'
import {
  Search,
  FilterList,
  AdminPanelSettings,
  Person,
  Email,
  CalendarToday,
  People,
} from '@mui/icons-material'
import { apiService } from '@/services/api'
import { User } from '@/types'
import { formatDate } from '@/utils/dateformat'

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [debouncedRoleFilter, setDebouncedRoleFilter] = useState<string>('')

  // Debounced search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRoleFilter(roleFilter)
    }, 300)

    return () => clearTimeout(timer)
  }, [roleFilter])

  // Invalidate queries when filters change
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-users', debouncedSearchTerm, debouncedRoleFilter] })
  }, [debouncedSearchTerm, debouncedRoleFilter, queryClient])

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', debouncedSearchTerm, debouncedRoleFilter],
    queryFn: () =>
      apiService.getUsers({
        search: debouncedSearchTerm || undefined,
        pageSize: 1000, // Get all users for admin view
      }),
    placeholderData: (previousData) => previousData,
  })

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value)
    setPage(0)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'error'
      case 'User':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <AdminPanelSettings />
      case 'User':
        return <Person />
      default:
        return <Person />
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
        Failed to load users. Please try again.
      </Alert>
    )
  }

  const users = usersData?.data || []
  const filteredUsers = roleFilter
    ? users.filter((user: User) => user.role === roleFilter)
    : users

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <People color="primary" />
        Manage Users
      </Typography>

      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Search users"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>

          {/* Role Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters Button */}
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('')
                setPage(0)
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>


      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Member Since</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={user?.profileImageUrl ? (() => {
                          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
                          return `${baseUrl}/users/${user.id}/profile-image`
                        })() : undefined}
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(user.updatedAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box py={3}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || roleFilter ? 'No users match the selected criteria' : 'No users registered yet'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

    </Box>
  )
}

export default AdminUsers
