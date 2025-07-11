import React from 'react';
import { Box, Typography } from '@mui/material';

const MyListings = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Listings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        My listings page will be implemented here.
      </Typography>
    </Box>
  );
};

export default MyListings;
