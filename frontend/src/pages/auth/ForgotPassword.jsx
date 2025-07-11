import React from 'react';
import { Box, Typography } from '@mui/material';

const ForgotPassword = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Forgot password functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default ForgotPassword;
