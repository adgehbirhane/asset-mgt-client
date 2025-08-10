import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Avatar,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  Assignment,
  Person,
  AdminPanelSettings,
  People,
  Logout,
  ExpandLess,
  ExpandMore,
  Settings,
  Category,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const drawerWidth = 240

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [adminPanelOpen, setAdminPanelOpen] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleProfileMenuClose()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleAdminPanelToggle = () => {
    setAdminPanelOpen(!adminPanelOpen)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Assets', icon: <Inventory />, path: '/assets' },
    { text: 'My Requests', icon: <Assignment />, path: '/requests' },
  ]

  const adminMenuItems = [
    { text: 'Manage Assets', icon: <Inventory />, path: '/admin/assets' },
    { text: 'Asset Requests', icon: <Assignment />, path: '/admin/requests' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Categories', icon: <Category />, path: '/admin/categories' },
  ]

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Asset Management
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              position: 'relative',
              backgroundColor: isActive(item.path) ? 'primary.50' : 'transparent',
              color: isActive(item.path) ? 'primary.main' : 'inherit',
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'primary.50' : 'action.hover',
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&::before': isActive(item.path) ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: 'primary.main',
                borderRadius: '0 2px 2px 0',
              } : {},
            }}
          >
            <ListItemIcon sx={{ 
              color: isActive(item.path) ? 'primary.main' : 'inherit',
              ml: isActive(item.path) ? 1 : 0,
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                fontWeight: isActive(item.path) ? 500 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
      {user?.role === 'Admin' && (
        <>
          <Divider />
          <List>
            <ListItem 
              button 
              onClick={handleAdminPanelToggle}
              sx={{
                position: 'relative',
                backgroundColor: 'transparent',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
              }}>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Panel" 
                sx={{
                  fontWeight: 400,
                }}
              />
              {adminPanelOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={adminPanelOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminMenuItems.map((item) => (
                  <ListItem
                    button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    sx={{ 
                      pl: 4,
                      position: 'relative',
                      backgroundColor: isActive(item.path) ? 'primary.50' : 'transparent',
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                      '&:hover': {
                        backgroundColor: isActive(item.path) ? 'primary.50' : 'action.hover',
                      },
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      '&::before': isActive(item.path) ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: 'primary.main',
                        borderRadius: '0 2px 2px 0',
                      } : {},
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                      ml: isActive(item.path) ? 1 : 0,
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{
                        fontWeight: isActive(item.path) ? 500 : 400,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Asset Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'right', gap: 1 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: "right", color: 'text.primary' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{  textAlign: "right", color: 'text.secondary' }}>
                  {user?.role}
                </Typography>
              </Box>
              <Avatar 
                src={user?.profileImageUrl ? (() => {
                  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
                  return `${baseUrl}/users/${user.id}/profile-image`
                })() : undefined}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                onClick={handleProfileMenuOpen}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        <MenuItem onClick={() => handleNavigation('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Layout
