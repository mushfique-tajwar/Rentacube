import React from 'react';
import { Box, Typography } from '@mui/material';

const Profile = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      <Typography variant="body1" color="text.secondary">
        User profile functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default Profile;
