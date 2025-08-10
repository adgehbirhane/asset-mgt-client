import { useState, useRef } from 'react'
import {
    Box,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
} from '@mui/material'
import {
    Warning as WarningIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Build as BuildIcon,
    Block as BlockIcon,
} from '@mui/icons-material'
import { Asset } from '@/types'
import AssetStatusBadge from './AssetStatusBadge'

const AssetStatusSelector: React.FC<{
    asset: Asset
    onStatusChange: (assetId: string, newStatus: string) => void
    isPending: boolean
}> = ({ asset, onStatusChange, isPending }) => {
    const [isOpen, setIsOpen] = useState(false)
    const anchorRef = useRef<HTMLButtonElement>(null)

    const handleStatusChange = (newStatus: string) => {
        onStatusChange(asset.id, newStatus)
        setIsOpen(false)
    }

    // Don't allow status change for assigned assets
    const isAssigned = asset.status === 'Assigned'
    const canChangeStatus = !isAssigned

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <AssetStatusBadge status={asset.status} />
            {canChangeStatus && (
                <>
                    <IconButton
                        ref={anchorRef}
                        size="small"
                        onClick={() => setIsOpen(true)}
                        disabled={isPending}
                        sx={{ 
                            p: 0.5,
                            '&:hover': { 
                                backgroundColor: 'action.hover',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <MoreVertIcon fontSize="small" color="action" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorRef.current}
                        open={isOpen}
                        onClose={() => setIsOpen(false)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 140,
                                boxShadow: 3,
                                '& .MuiMenuItem-root': {
                                    fontSize: '0.875rem',
                                    py: 1,
                                    px: 2,
                                }
                            }
                        }}
                    >
                        <MenuItem 
                            onClick={() => handleStatusChange('Available')}
                            disabled={asset.status === 'Available' || isPending}
                            sx={{
                                color: asset.status === 'Available' ? 'success.main' : 'inherit',
                                fontWeight: asset.status === 'Available' ? 600 : 400,
                            }}
                        >
                            <CheckCircleIcon 
                                sx={{ 
                                    mr: 1.5, 
                                    fontSize: 18,
                                    color: asset.status === 'Available' ? 'success.main' : 'action.active'
                                }} 
                            />
                            Available
                        </MenuItem>
                        <MenuItem 
                            onClick={() => handleStatusChange('Maintenance')}
                            disabled={asset.status === 'Maintenance' || isPending}
                            sx={{
                                color: asset.status === 'Maintenance' ? 'info.main' : 'inherit',
                                fontWeight: asset.status === 'Maintenance' ? 600 : 400,
                            }}
                        >
                            <BuildIcon 
                                sx={{ 
                                    mr: 1.5, 
                                    fontSize: 18,
                                    color: asset.status === 'Maintenance' ? 'info.main' : 'action.active'
                                }} 
                            />
                            Maintenance
                        </MenuItem>
                        <MenuItem 
                            onClick={() => handleStatusChange('Retired')}
                            disabled={asset.status === 'Retired' || isPending}
                            sx={{
                                color: asset.status === 'Retired' ? 'text.secondary' : 'inherit',
                                fontWeight: asset.status === 'Retired' ? 600 : 400,
                            }}
                        >
                            <BlockIcon 
                                sx={{ 
                                    mr: 1.5, 
                                    fontSize: 18,
                                    color: asset.status === 'Retired' ? 'text.secondary' : 'action.active'
                                }} 
                            />
                            Retired
                        </MenuItem>
                    </Menu>
                </>
            )}
            {isAssigned && (
                <Tooltip title="Status can only be changed when request is approved">
                    <IconButton size="small" disabled>
                        <WarningIcon color="warning" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    )
}

export default AssetStatusSelector;