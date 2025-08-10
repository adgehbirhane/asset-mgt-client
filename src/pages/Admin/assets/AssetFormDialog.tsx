import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material'
import { Asset, Category} from '@/types'
import { getImageUrl } from '@/utils/imageUtils'

const AssetFormDialog: React.FC<{
    open: boolean
    onClose: () => void
    asset?: Asset
    categories: Category[]
    onSubmit: (data: any) => void
    isPending: boolean
  }> = ({ open, onClose, asset, categories, onSubmit, isPending }) => {
    const [formData, setFormData] = useState({
      name: asset?.name || '',
      categoryId: asset?.categoryId || '',
      serialNumber: asset?.serialNumber || '',
      purchaseDate: asset?.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      image: null as File | null
    })
  
    const [imagePreview, setImagePreview] = useState<string | null>(
      asset?.imageUrl ? getImageUrl(asset.imageUrl) : null
    )
  
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setFormData(prev => ({ ...prev, image: file }))
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  
    const handleSubmit = () => {
      // Basic validation
      if (!formData.name || !formData.categoryId || !formData.serialNumber || !formData.purchaseDate) {
        return
      }
      onSubmit(formData)
    }
  
    const handleClose = () => {
      onClose()
    }
  
    // Reset form when asset changes
    useEffect(() => {
      if (asset) {
        setFormData({
          name: asset.name || '',
          categoryId: asset.categoryId || '',
          serialNumber: asset.serialNumber || '',
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
          image: null
        })
        setImagePreview(asset.imageUrl ? getImageUrl(asset.imageUrl) : null)
      } else {
        setFormData({
          name: '',
          categoryId: '',
          serialNumber: '',
          purchaseDate: '',
          image: null
        })
        setImagePreview(null)
      }
    }, [asset])
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {asset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Asset Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  required
                  error={!formData.name}
                  helperText={!formData.name ? 'Asset name is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!formData.categoryId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!formData.categoryId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      Category is required
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  fullWidth
                  required
                  error={!formData.serialNumber}
                  helperText={!formData.serialNumber ? 'Serial number is required' : ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Purchase Date"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  fullWidth
                  required
                  error={!formData.purchaseDate}
                  helperText={!formData.purchaseDate ? 'Purchase date is required' : ''}
                  InputLabelProps={{ shrink: true }}
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
                      startIcon={<AddIcon />}
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={imagePreview}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, image: null }))
                            setImagePreview(null)
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : (asset ? 'Update Asset' : 'Create Asset')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  export default AssetFormDialog;
  