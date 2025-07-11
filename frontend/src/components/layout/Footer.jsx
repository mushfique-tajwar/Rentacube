import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Link,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Rentacube
            </Typography>
            <Typography variant="body2" color="grey.300" sx={{ mb: 2 }}>
              Your trusted rental marketplace for everything you need. 
              Rent anything, anywhere, anytime.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/listings" color="grey.300" underline="hover">
                Browse Items
              </Link>
              <Link href="/register" color="grey.300" underline="hover">
                Sign Up
              </Link>
              <Link href="/login" color="grey.300" underline="hover">
                Login
              </Link>
              <Link href="/about" color="grey.300" underline="hover">
                About Us
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/listings?category=electronics" color="grey.300" underline="hover">
                Electronics
              </Link>
              <Link href="/listings?category=tools" color="grey.300" underline="hover">
                Tools
              </Link>
              <Link href="/listings?category=furniture" color="grey.300" underline="hover">
                Furniture
              </Link>
              <Link href="/listings?category=sports" color="grey.300" underline="hover">
                Sports
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="grey.300" underline="hover">
                Help Center
              </Link>
              <Link href="/contact" color="grey.300" underline="hover">
                Contact Us
              </Link>
              <Link href="/terms" color="grey.300" underline="hover">
                Terms of Service
              </Link>
              <Link href="/privacy" color="grey.300" underline="hover">
                Privacy Policy
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  info@rentacube.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2" color="grey.300">
                  New York, NY
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" color="grey.400">
            © 2025 Rentacube. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/terms" color="grey.400" underline="hover">
              Terms
            </Link>
            <Link href="/privacy" color="grey.400" underline="hover">
              Privacy
            </Link>
            <Link href="/cookies" color="grey.400" underline="hover">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
