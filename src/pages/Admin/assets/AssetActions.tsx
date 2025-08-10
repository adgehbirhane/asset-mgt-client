import {
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { Asset } from '@/types'

// Asset Actions Component
const AssetActions: React.FC<{
    asset: Asset
    onView: (asset: Asset) => void
    onEdit: (asset: Asset) => void
    onDelete: (asset: Asset) => void
  }> = ({ asset, onView, onEdit, onDelete }) => {
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip title="View Asset Details">
          <IconButton
            size="small"
            onClick={() => onView(asset)}
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Asset">
          <IconButton
            size="small"
            onClick={() => onEdit(asset)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Asset">
          <IconButton
            size="small"
            onClick={() => onDelete(asset)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    )
  }

  export default AssetActions
  