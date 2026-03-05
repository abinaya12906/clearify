import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const gstin = localStorage.getItem('gstin');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          CleariFy GST Platform
        </Typography>
        {gstin && (
          <Box>
            <Typography
              variant="body2"
              component="span"
              sx={{ mr: 2 }}
            >
              {gstin}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;