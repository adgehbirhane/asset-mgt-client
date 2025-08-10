import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
} from '@mui/material'
import {
  Person,
  CalendarToday,
  AdminPanelSettings,
  Edit,
  Save,
  Cancel,
  AccountCircle,
  Email,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'
import ProfileImageUpload from './Admin/profile/ProfileImageUpload'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
}

// Main Profile Component
const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', severity: 'success' })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiService.updateUser(user!.id, data),
    onSuccess: (response) => {
      if (response.data) {
        updateUser(response.data)
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' })
        setIsEditing(false)
      }
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      })
    },
  })

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => apiService.uploadProfileImage(user!.id, file),
    onSuccess: (response) => {
      if (response.data) {
        // Update the user with the response data which contains the complete user object
        updateUser(response.data)
        setSnackbar({ open: true, message: 'Profile image updated successfully!', severity: 'success' })
        queryClient.invalidateQueries({ queryKey: ['user'] })
      }
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to upload profile image',
        severity: 'error'
      })
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: () => apiService.deleteProfileImage(user!.id),
    onSuccess: () => {
      if (user) {
        // Update the user by removing the profile image URL
        const updatedUser = { ...user, profileImageUrl: undefined }
        updateUser(updatedUser)
        setSnackbar({ open: true, message: 'Profile image removed successfully!', severity: 'success' })
        queryClient.invalidateQueries({ queryKey: ['user'] })
      }
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to remove profile image',
        severity: 'error'
      })
    },
  })

  // Effects
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      })
    }
  }, [user, reset])

  // Event handlers
  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleImageUpload = (file: File) => {
    uploadImageMutation.mutate(file)
  }

  const handleImageDelete = () => {
    deleteImageMutation.mutate()
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle color="primary" />
          My Profile
        </Typography>
        <Box>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Image and Summary */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Profile Image */}
            <Card>
              <CardContent>
                <ProfileImageUpload
                  currentImageUrl={user.profileImageUrl ? (() => {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
                    return `${baseUrl}/users/${user.id}/profile-image`
                  })() : undefined}
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  isPending={uploadImageMutation.isPending || deleteImageMutation.isPending}
                  userId={user.id}
                />
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" />
                  Profile Summary
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <AdminPanelSettings sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="primary.main">
                        Role
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="primary.main">
                        {user.role === 'Admin' ? 'Administrator' : 'User'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  {user.updatedAt !== user.createdAt && (
                    <Box display="flex" alignItems="center">
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(user.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit color="primary" />
                Personal Information
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: 'First name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="First Name"
                          error={!!errors.firstName}
                          helperText={errors.firstName?.message}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: 'Last name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Last Name"
                          error={!!errors.lastName}
                          helperText={errors.lastName?.message}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Profile
