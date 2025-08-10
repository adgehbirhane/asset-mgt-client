import {
    Chip,
} from '@mui/material'
import {
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Build as BuildIcon,
    Block as BlockIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material'

const AssetStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available':
                return 'success'
            case 'Assigned':
                return 'warning'
            case 'Maintenance':
                return 'info'
            case 'Retired':
                return 'error'
            default:
                return 'default'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Available':
                return <CheckCircleIcon />
            case 'Assigned':
                return <WarningIcon />
            case 'Maintenance':
                return <BuildIcon />
            case 'Retired':
                return <BlockIcon />
            default:
                return <InventoryIcon />
        }
    }

    return (
        <Chip
            icon={getStatusIcon(status)}
            label={status}
            color={getStatusColor(status) as any}
            size="small"
            variant="outlined"
        />
    )
}


export default AssetStatusBadge;