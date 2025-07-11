import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  AccountCircle,
  Add,
  Dashboard,
  ExitToApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { logoutUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            cursor: 'pointer', 
            color: 'primary.main',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/')}
        >
          Rentacube
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/listings')}
            sx={{ color: 'text.primary' }}
          >
            Browse
          </Button>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'renter' && (
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => navigate('/create-listing')}
                  size="small"
                >
                  List Item
                </Button>
              )}
              
              <IconButton onClick={handleMenuOpen}>
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.firstName}
                  sx={{ width: 32, height: 32 }}
                >
                  {user?.firstName?.[0]}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Chip 
                    label={user?.role} 
                    size="small" 
                    color="primary" 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                
                <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ color: 'text.primary' }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')}
                size="small"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
