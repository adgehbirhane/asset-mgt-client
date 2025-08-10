import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  CloudUpload,
  Delete,
} from '@mui/icons-material'
import { apiService } from '@/services/api'
import { CreateAssetRequest, UpdateAssetRequest } from '@/types'
import { getImageUrl } from '@/utils/imageUtils'

interface AssetFormData {
  name: string
  categoryId: string
  serialNumber: string
  purchaseDate: Date | null
  image?: File
}

const AssetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const isEditing = !!id

  // Fetch asset data for editing
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => apiService.getAsset(id!),
    enabled: isEditing,
  })

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories({ pageSize: 100 })
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetFormData>({
    defaultValues: {
      name: '',
      categoryId: '',
      serialNumber: '',
      purchaseDate: null,
    },
  })

  // Update form when asset data is loaded
  useEffect(() => {
    if (assetData?.data) {
      const asset = assetData.data
      reset({
        name: asset.name,
        categoryId: asset.categoryId,
        serialNumber: asset.serialNumber,
        purchaseDate: new Date(asset.purchaseDate),
      })
      if (asset.imageUrl) {
        setImagePreview(getImageUrl(asset.imageUrl))
      }
    }
  }, [assetData, reset])

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: (data: CreateAssetRequest) => apiService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setSnackbarMessage('Asset created successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setTimeout(() => navigate('/admin/assets'), 1500)
    },
    onError: (error: any) => {
      setSnackbarMessage(`Failed to create asset: ${error.response?.data?.message || error.message}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    },
  })

  const updateAssetMutation = useMutation({
    mutationFn: (data: UpdateAssetRequest) => apiService.updateAsset(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', id] })
      setSnackbarMessage('Asset updated successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setTimeout(() => navigate('/admin/assets'), 1500)
    },
    onError: (error: any) => {
      setSnackbarMessage(`Failed to update asset: ${error.response?.data?.message || error.message}`)
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    },
  })

  const onSubmit = async (data: AssetFormData) => {
    const assetData = {
      name: data.name,
      categoryId: data.categoryId,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate?.toISOString().split('T')[0] || '',
      image: selectedImage,
    }

    if (isEditing) {
      updateAssetMutation.mutate(assetData)
    } else {
      createAssetMutation.mutate(assetData)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  if (assetLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/assets')}
          sx={{ mr: 2 }}
        >
          Back to Assets
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Asset' : 'Create New Asset'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register('name', { required: 'Asset name is required' })}
                  label="Asset Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    {...register('categoryId', { required: 'Category is required' })}
                    label="Category"
                  >
                    {categoriesData?.data?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <Typography variant="caption" color="error">
                      {errors.categoryId.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register('serialNumber', { required: 'Serial number is required' })}
                  label="Serial Number"
                  fullWidth
                  error={!!errors.serialNumber}
                  helperText={errors.serialNumber?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="purchaseDate"
                  control={control}
                  rules={{ required: 'Purchase date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Purchase Date"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.purchaseDate,
                          helperText: errors.purchaseDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Asset Image
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    {imagePreview && (
                      <>
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Asset preview"
                          sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/assets')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={createAssetMutation.isPending || updateAssetMutation.isPending}
                  >
                    {createAssetMutation.isPending || updateAssetMutation.isPending
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Asset'
                      : 'Create Asset'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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

export default AssetForm
