const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/placeholder-asset.jpg'
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it's just a filename, construct the full URL
  return `${API_BASE_URL}/assets/images/${imageUrl}`
}
