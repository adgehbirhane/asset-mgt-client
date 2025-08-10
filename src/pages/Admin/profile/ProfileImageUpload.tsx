import { useState, useRef } from 'react'
import {
    Box,
    Button,
    Avatar,
    IconButton,
    Stack,
} from '@mui/material'
import {
    Person,
    PhotoCamera,
    Delete,
} from '@mui/icons-material'

// Profile Image Upload Component
const ProfileImageUpload: React.FC<{
    currentImageUrl?: string
    onImageUpload: (file: File) => void
    onImageDelete: () => void
    isPending: boolean
    userId: string
}> = ({ currentImageUrl, onImageUpload, onImageDelete, isPending, userId }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null)

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onImageUpload(file)
        }
    }

    const handleDeleteImage = () => {
        setImagePreview(null)
        onImageDelete()
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Box position="relative">
                <Avatar
                    src={imagePreview || currentImageUrl}
                    sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        bgcolor: 'primary.main',
                        border: '4px solid',
                        borderColor: 'primary.light',
                        boxShadow: 3,
                    }}
                >
                    {!imagePreview && !currentImageUrl && <Person sx={{ fontSize: '3rem' }} />}
                </Avatar>

                <Box position="absolute" bottom={0} right={0}>
                    <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="label"
                        disabled={isPending}
                        sx={{
                            bgcolor: 'background.paper',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'white',
                            },
                        }}
                    >
                        <input
                            hidden
                            accept="image/*"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <PhotoCamera />
                    </IconButton>
                </Box>
            </Box>

            <Stack direction="row" spacing={1}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    startIcon={<PhotoCamera />}
                >
                    Change Photo
                </Button>
                {(imagePreview || currentImageUrl) && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleDeleteImage}
                        disabled={isPending}
                        startIcon={<Delete />}
                    >
                        Remove
                    </Button>
                )}
            </Stack>
        </Box>
    )
}

export default ProfileImageUpload;