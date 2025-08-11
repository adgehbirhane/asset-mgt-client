# Asset Management System

Frondend Employee Asset Management System built with React, TypeScript, Material-UI, and Vite. This application allows employees to request assets and administrators to manage the entire asset lifecycle.

## Features

### 👥 User Features
- **Asset Browsing**: View all available company assets with detailed information
- **Asset Requests**: Request available assets with confirmation dialogs
- **Request Tracking**: Monitor the status of your asset requests
- **Profile Management**: View and update personal information

### 🛠️ Admin Features
- **Asset Management**: Complete CRUD operations for company assets
- **Request Processing**: Approve or reject asset requests
- **User Management**: View all system users and their details
- **Asset Categories**: Support for Laptop, Phone, Monitor, Tablet, Desktop, and Other
- **Asset Status Tracking**: Available, Assigned, Maintenance, Retired
- **File Upload**: Image upload for asset documentation
- **Advanced Filtering**: Search and filter assets by various criteria

## Technology Stack
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Material-UI (MUI)**: Professional UI components
- **React Hook Form**: Efficient form handling with validation
- **React Query**: Server state management and caching
- **React Router**: Client-side routing
- **Date-fns**: Date manipulation utilities

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **Vite**: Fast development and build tooling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adgehbirhane/asset-mgt-client
   cd asset-mgt-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Demo Credentials

### Admin User
- **Email**: admin@gmail.com
- **Password**: Admin@123
- **Role**: Administrator

### Regular User
- **Email**: user@gmail.com
- **Password**: User@123
- **Role**: User
