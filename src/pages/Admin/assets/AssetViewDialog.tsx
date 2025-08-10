import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider
} from '@mui/material'
import {
  Inventory as InventoryIcon, 
  Person as PersonIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  QrCode as SerialNumberIcon,
} from '@mui/icons-material'
import { Asset} from '@/types'
import { getImageUrl } from '@/utils/imageUtils'
import AssetStatusBadge from './AssetStatusBadge'
import { formatDate } from '@/utils/dateformat'

  const AssetViewDialog: React.FC<{
    open: boolean
    onClose: () => void
    asset: Asset | null
  }> = ({ open, onClose, asset }) => {
    if (!asset) return null
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Asset Image */}
            <Grid item xs={12} md={4}>
              {asset.imageUrl ? (
                <Avatar
                  src={getImageUrl(asset.imageUrl)}
                  variant="rounded"
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
              )}
            </Grid>
            
            {/* Asset Information */}
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {asset.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {asset.category.name} • {asset.serialNumber}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="action" sx={{ fontSize: 16 }} />
                        {asset.category.name}
                      </Typography>
                    </Box>
                  </Grid>
                  
                                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Serial Number
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SerialNumberIcon color="action" sx={{ fontSize: 16 }} />
                          {asset.serialNumber}
                        </Typography>
                      </Box>
                    </Grid>
                  
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Purchase Date
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon color="action" sx={{ fontSize: 16 }} />
                        {formatDate(asset.purchaseDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <AssetStatusBadge status={asset.status} />
                    </Box>
                  </Grid>
                  
                  {asset.assignedTo && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Assigned To
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="action" sx={{ fontSize: 16 }} />
                          {typeof asset.assignedTo === 'object' && asset.assignedTo !== null && 'firstName' in asset.assignedTo
                            ? `${(asset.assignedTo as any).firstName} ${(asset.assignedTo as any).lastName}`
                            : String(asset.assignedTo)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  export default AssetViewDialog;