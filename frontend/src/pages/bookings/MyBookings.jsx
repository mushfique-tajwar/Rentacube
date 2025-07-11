import React from 'react';
import { Box, Typography } from '@mui/material';

const MyBookings = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        My bookings page will be implemented here.
      </Typography>
    </Box>
  );
};

export default MyBookings;
