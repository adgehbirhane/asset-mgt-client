export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  status: string
  assetsCount?: number
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: string
  name: string
  categoryId: string
  category: Category
  serialNumber: string
  purchaseDate: string
  status: string
  assignedToId?: string
  assignedTo?: User
  assignedAt?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AssetRequest {
  id: string
  assetId: string
  userId: string
  status: string
  requestedAt: string
  processedAt?: string
  processedById?: string
  processedBy?: User
  asset: Asset
  user: User
}

// Enums matching backend exactly
export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum AssetStatus {
  Available = 'Available',
  Assigned = 'Assigned',
  Maintenance = 'Maintenance',
  Retired = 'Retired'
}

export enum AssetRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

// Auth DTOs matching backend
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Asset DTOs matching backend exactly
export interface CreateAssetRequest {
  name: string
  categoryId: string
  serialNumber: string
  purchaseDate: string
  image?: File
}

export interface UpdateAssetRequest {
  name?: string
  categoryId?: string
  serialNumber?: string
  purchaseDate?: string
  image?: File
}

export interface UpdateAssetStatusRequest {
  status: string
}

// Asset Request DTOs matching backend exactly
export interface CreateAssetRequestDto {
  assetId: string
}

export interface UpdateAssetRequestDto {
  status: string
}

// Category DTOs matching backend exactly
export interface CreateCategoryDto {
  name: string
  description: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
}

// API Response DTOs matching backend exactly
export interface ApiResponse<T> {
  data?: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Query Parameters matching backend exactly
export interface QueryParameters {
  page?: number
  pageSize?: number
  search?: string
}

export interface AssetQueryParameters extends QueryParameters {
  category?: string
  status?: string
}

export interface AssetRequestQueryParameters {
  page?: number
  pageSize?: number
  status?: string
}

export interface CategoryQueryParameters extends QueryParameters {
  status?: string
}

// Frontend state interfaces
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
