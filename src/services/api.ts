import axios, { AxiosInstance, AxiosResponse } from 'axios'
import {
  User,
  Asset,
  AssetRequest,
  LoginRequest,
  RegisterRequest,
  CreateAssetRequest,
  UpdateAssetRequest,
  UpdateAssetStatusRequest,
  ApiResponse,
  PaginatedResponse,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateAssetRequestDto,
  UpdateAssetRequestDto,
  AssetQueryParameters,
  AssetRequestQueryParameters,
  CategoryQueryParameters,
  QueryParameters,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't automatically redirect on 401 - let components handle it
        // Just clear the invalid token
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/auth/register', userData)
    return response.data
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me')
    return response.data
  }

  // Asset endpoints
  async getAssets(params?: AssetQueryParameters): Promise<PaginatedResponse<Asset>> {
    const response: AxiosResponse<PaginatedResponse<Asset>> = await this.api.get('/assets', { params })
    return response.data
  }

  async getAsset(id: string): Promise<ApiResponse<Asset>> {
    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.get(`/assets/${id}`)
    return response.data
  }

  async createAsset(assetData: CreateAssetRequest): Promise<ApiResponse<Asset>> {
    const formData = new FormData()
    formData.append('name', assetData.name)
    formData.append('categoryId', assetData.categoryId)
    formData.append('serialNumber', assetData.serialNumber)
    formData.append('purchaseDate', assetData.purchaseDate)
    if (assetData.image) {
      formData.append('image', assetData.image)
    }

    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.post('/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateAsset(id: string, assetData: UpdateAssetRequest): Promise<ApiResponse<Asset>> {
    const formData = new FormData()
    if (assetData.name) formData.append('name', assetData.name)
    if (assetData.categoryId) formData.append('categoryId', assetData.categoryId)
    if (assetData.serialNumber) formData.append('serialNumber', assetData.serialNumber)
    if (assetData.purchaseDate) formData.append('purchaseDate', assetData.purchaseDate)
    if (assetData.image) formData.append('image', assetData.image)

    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.put(`/assets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateAssetStatus(id: string, statusData: UpdateAssetStatusRequest): Promise<ApiResponse<Asset>> {
    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.patch(`/assets/${id}/status`, statusData)
    return response.data
  }

  async deleteAsset(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/assets/${id}`)
    return response.data
  }

  // Asset Request endpoints - Fixed to match backend DTO
  async getMYAssetRequests(params?: AssetRequestQueryParameters): Promise<PaginatedResponse<AssetRequest>> {
    const response: AxiosResponse<PaginatedResponse<AssetRequest>> = await this.api.get('/asset-requests/self', { params })
    return response.data
  }

    // Asset Request endpoints - Fixed to match backend DTO
    async getAssetRequests(params?: AssetRequestQueryParameters): Promise<PaginatedResponse<AssetRequest>> {
      const response: AxiosResponse<PaginatedResponse<AssetRequest>> = await this.api.get('/asset-requests', { params })
      return response.data
    }

  async createAssetRequest(requestData: CreateAssetRequestDto): Promise<ApiResponse<AssetRequest>> {
    const response: AxiosResponse<ApiResponse<AssetRequest>> = await this.api.post('/asset-requests', requestData)
    return response.data
  }

  async updateAssetRequest(id: string, statusData: UpdateAssetRequestDto): Promise<ApiResponse<AssetRequest>> {
    const newStatus = statusData.status === "Approved" ? 1 : 2;
    const response: AxiosResponse<ApiResponse<AssetRequest>> = await this.api.put(`/asset-requests/${id}`, { status: newStatus });
    return response.data
  }

  // User endpoints
  async getUsers(params?: QueryParameters): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/users', { params })
    return response.data
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${id}`)
    return response.data
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/users/${id}`, userData)
    return response.data
  }

  async uploadProfileImage(id: string, imageFile: File): Promise<ApiResponse<User>> {
    const formData = new FormData()
    formData.append('imageFile', imageFile)

    const response: AxiosResponse<ApiResponse<User>> = await this.api.post(`/users/${id}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteProfileImage(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/users/${id}/profile-image`)
    return response.data
  }

  async getCategories(params?: CategoryQueryParameters): Promise<PaginatedResponse<Category>> {
    const response: AxiosResponse<PaginatedResponse<Category>> = await this.api.get('/categories', { params })
    return response.data
  }

  async getAllCategories(params?: CategoryQueryParameters): Promise<PaginatedResponse<Category>> {
    const response: AxiosResponse<PaginatedResponse<Category>> = await this.api.get('/categories/all', { params })
    return response.data
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.get(`/categories/${id}`)
    return response.data
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.post('/categories', categoryData)
    return response.data
  }

  async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.put(`/categories/${id}`, categoryData)
    return response.data
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/categories/${id}`)
    return response.data
  }

  async updateCategoryStatus(id: string): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.patch(`/categories/${id}/status`)
    return response.data
  }
}

export const apiService = new ApiService()
