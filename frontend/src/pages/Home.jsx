import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { 
  Search,
  Category,
  Security,
  Support,
  TrendingUp,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Electronics', icon: '📱', count: '150+ items' },
    { name: 'Tools', icon: '🔧', count: '200+ items' },
    { name: 'Furniture', icon: '🛋️', count: '120+ items' },
    { name: 'Sports', icon: '⚽', count: '80+ items' },
    { name: 'Photography', icon: '📸', count: '90+ items' },
    { name: 'Outdoor', icon: '🏕️', count: '110+ items' },
  ];

  const features = [
    {
      icon: <Security color="primary" />,
      title: 'Secure Payments',
      description: 'All transactions are protected with advanced encryption'
    },
    {
      icon: <Support color="primary" />,
      title: '24/7 Support',
      description: 'Get help anytime with our dedicated support team'
    },
    {
      icon: <TrendingUp color="primary" />,
      title: 'Best Prices',
      description: 'Compare prices and find the best deals in your area'
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Rent Anything, Anywhere, Anytime
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Your trusted marketplace for renting everything from tools to electronics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => navigate('/listings')}
                >
                  Start Browsing
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  List Your Items
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="div" sx={{ mb: 2, fontSize: '4rem' }}>
                  🏠📦🔧
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>
                  Join thousands of happy renters and lenders
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Section */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Find What You Need
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <TextField
              fullWidth
              placeholder="Search for items, tools, equipment..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ minWidth: 120 }}
              onClick={() => navigate('/listings')}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Browse Categories
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Discover items in popular categories
          </Typography>
          
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                  onClick={() => navigate(`/listings?category=${category.name.toLowerCase()}`)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="div" sx={{ mb: 2 }}>
                      {category.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Chip 
                      label={category.count} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose Rentacube?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" component="div" gutterBottom>
                1000+
              </Typography>
              <Typography variant="h6">
                Items Listed
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" component="div" gutterBottom>
                500+
              </Typography>
              <Typography variant="h6">
                Happy Users
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" component="div" gutterBottom>
                200+
              </Typography>
              <Typography variant="h6">
                Successful Rentals
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" component="div" gutterBottom>
                4.8★
              </Typography>
              <Typography variant="h6">
                Average Rating
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Ready to Start Renting?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join our community of renters and lenders today
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
              >
                Sign Up Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/listings')}
              >
                Browse Items
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
