import React from 'react';
import { Box, Typography } from '@mui/material';

const ListingDetails = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Listing Details
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Listing details page will be implemented here.
      </Typography>
    </Box>
  );
};

export default ListingDetails;
