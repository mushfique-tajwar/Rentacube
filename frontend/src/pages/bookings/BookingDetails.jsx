import React from 'react';
import { Box, Typography } from '@mui/material';

const BookingDetails = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Booking Details
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Booking details page will be implemented here.
      </Typography>
    </Box>
  );
};

export default BookingDetails;
