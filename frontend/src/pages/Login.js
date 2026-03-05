import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField,
  Typography, Paper, Tab, Tabs,
  CircularProgress, Divider
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

function Login() {
  const [tab, setTab] = useState(0);
  const [gstin, setGstin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!gstin) {
      toast.error('Please enter GSTIN!');
      return;
    }
    if (!password) {
      toast.error('Please enter password!');
      return;
    }
    if (gstin.length !== 15) {
      toast.error('GSTIN must be 15 characters!');
      return;
    }

    setLoading(true);
    try {
      const role = tab === 0 ? 'seller' : 'buyer';
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
        { gstin, password, role }
      );
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('gstin', response.data.gstin);
      localStorage.setItem('role', response.data.role);
      toast.success(`✅ Welcome ${gstin}!`);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('❌ Server not running!');
      } else {
        toast.error(
          `❌ ${err.response.data.detail || 'Login failed'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Paper elevation={4} sx={{
        padding: 4,
        width: 420,
        borderRadius: 2
      }}>
        {/* Logo */}
        <Typography
          variant="h3"
          align="center"
          color="primary"
          fontWeight="bold"
          gutterBottom
        >
          CleariFy
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          gutterBottom
        >
          GST Compliance Platform
        </Typography>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          centered
          sx={{ mb: 3, mt: 1 }}
        >
          <Tab label="🏪 Seller Login" />
          <Tab label="🛒 Buyer Login" />
        </Tabs>

        {/* GSTIN */}
        <TextField
          fullWidth
          label="GSTIN *"
          value={gstin}
          onChange={(e) => setGstin(
            e.target.value.toUpperCase()
          )}
          margin="normal"
          placeholder="Ex: 27AAPFU0939F1ZV"
          inputProps={{ maxLength: 15 }}
          helperText={`${gstin.length}/15 characters`}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        />

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{ mt: 3, mb: 2, height: 50 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Login as ${tab === 0 ? '🏪 Seller' : '🛒 Buyer'}`
          )}
        </Button>

        {/* Divider */}
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Register Button */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ height: 50, borderRadius: 2 }}
        >
          📝 Create New Account
        </Button>

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          New to CleariFy? Register your business today!
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
