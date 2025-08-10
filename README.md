# Asset Management System

A professional full-stack Employee Asset Management System built with React, TypeScript, Material-UI, and Vite. This application allows employees to request assets and administrators to manage the entire asset lifecycle.

## Features

### 🔐 Authentication
- **User Registration & Login**: Secure JWT-based authentication
- **Role-based Access Control**: Separate interfaces for Users and Administrators
- **Password Security**: Secure password hashing and validation
- **Session Management**: Persistent login with automatic token refresh

### 👥 User Features
- **Asset Browsing**: View all available company assets with detailed information
- **Asset Requests**: Request available assets with confirmation dialogs
- **Request Tracking**: Monitor the status of your asset requests
- **Profile Management**: View and update personal information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🛠️ Admin Features
- **Asset Management**: Complete CRUD operations for company assets
- **Request Processing**: Approve or reject asset requests
- **User Management**: View all system users and their details
- **Asset Categories**: Support for Laptop, Phone, Monitor, Tablet, Desktop, and Other
- **Asset Status Tracking**: Available, Assigned, Maintenance, Retired
- **File Upload**: Image upload for asset documentation
- **Advanced Filtering**: Search and filter assets by various criteria

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional Material-UI interface
- **Responsive Layout**: Adaptive design for all screen sizes
- **Real-time Updates**: Live data updates with React Query
- **Form Validation**: Comprehensive client-side validation
- **Loading States**: Professional loading indicators
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Toast notifications for user feedback

## Technology Stack

### Frontend
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
   git clone <repository-url>
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

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Main layout components
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Assets.tsx
│   ├── AssetDetails.tsx
│   ├── AssetRequests.tsx
│   ├── Profile.tsx
│   └── Admin/         # Admin-specific pages
│       ├── Assets.tsx
│       ├── AssetForm.tsx
│       ├── Requests.tsx
│       └── Users.tsx
├── services/          # API services
│   └── api.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── theme.ts           # Material-UI theme configuration
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## API Integration

The frontend expects a RESTful API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Assets
- `GET /api/assets` - Get all assets (with pagination/filtering)
- `GET /api/assets/:id` - Get specific asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Asset Requests
- `GET /api/asset-requests` - Get all requests
- `POST /api/asset-requests` - Create request
- `PUT /api/asset-requests/:id` - Update request status

### Users
- `GET /api/users` - Get all users (admin only)

## Demo Credentials

### Admin User
- **Email**: admin@company.com
- **Password**: Admin123!
- **Role**: Administrator

### Regular User
- **Email**: user@company.com
- **Password**: User123!
- **Role**: User

## Features in Detail

### Asset Management
- **Create Assets**: Add new assets with images, categories, and details
- **Edit Assets**: Update asset information and status
- **Delete Assets**: Remove assets from the system
- **Asset Images**: Upload and manage asset photos
- **Status Tracking**: Monitor asset availability and assignment

### Request System
- **Request Assets**: Users can request available assets
- **Approval Workflow**: Admins can approve or reject requests
- **Status Updates**: Real-time status tracking
- **Email Notifications**: (Backend implementation required)

### User Management
- **User Profiles**: View and edit user information
- **Role Management**: Admin and User roles
- **User Statistics**: Overview of user activity

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Protected routes for authenticated users
- **Admin Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based CSRF protection

## Performance Optimizations

- **React Query**: Efficient data fetching and caching
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized asset images
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Intelligent caching strategies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is the frontend application. Make sure to set up the corresponding backend API server to enable full functionality.
