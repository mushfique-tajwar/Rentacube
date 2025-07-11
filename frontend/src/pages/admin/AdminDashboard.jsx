import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Admin dashboard functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default AdminDashboard;
