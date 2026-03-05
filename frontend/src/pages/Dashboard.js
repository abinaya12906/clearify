import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography,
  Paper, Grid, Chip
} from '@mui/material';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const gstin = localStorage.getItem('gstin');
  const role = localStorage.getItem('role');
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    if (role === 'seller') {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/invoices/drafts/${gstin}`
      );
      setInvoiceCount(res.data.length);
      const total = res.data.reduce(
        (sum, inv) => sum + parseFloat(inv.total_amount || 0), 0
      );
      setTotalSales(total);
    } catch (err) {
      console.log('Could not fetch stats - Dashboard.js:33');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to CleariFy Dashboard
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
      >
        Logged in as: {gstin}
        <Chip
          label={role?.toUpperCase()}
          color={role === 'seller' ? 'primary' : 'secondary'}
          size="small"
          sx={{ ml: 1 }}
        />
      </Typography>

      {/* Stats for Seller */}
      {role === 'seller' && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={1} sx={{
              padding: 2, textAlign: 'center',
              backgroundColor: '#EBF3FB'
            }}>
              <Typography variant="h5" color="primary">
                {invoiceCount}
              </Typography>
              <Typography variant="body2">
                Total Invoices
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={1} sx={{
              padding: 2, textAlign: 'center',
              backgroundColor: '#E8F5E9'
            }}>
              <Typography variant="h5" color="success.main">
                ₹ {totalSales.toFixed(0)}
              </Typography>
              <Typography variant="body2">
                Total Sales
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Seller Options */}
        {role === 'seller' && (
          <>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{
                padding: 3, textAlign: 'center'
              }}>
                <Typography variant="h2">🧾</Typography>
                <Typography variant="h6" gutterBottom>
                  Create Invoice
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Generate new GST invoice
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/new-invoice')}
                  sx={{ mt: 1 }}
                >
                  New Invoice
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{
                padding: 3, textAlign: 'center'
              }}>
                <Typography variant="h2">📊</Typography>
                <Typography variant="h6" gutterBottom>
                  GSTR-1
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  View and file Sales Return
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => navigate('/gstr1')}
                  sx={{ mt: 1 }}
                >
                  View GSTR-1
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{
                padding: 3, textAlign: 'center'
              }}>
                <Typography variant="h2">💰</Typography>
                <Typography variant="h6" gutterBottom>
                  GSTR-3B
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Monthly summary and tax payment
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  onClick={() => navigate('/gstr3b')}
                  sx={{ mt: 1 }}
                >
                  View GSTR-3B
                </Button>
              </Paper>
            </Grid>
          </>
        )}

        {/* Buyer Options */}
        {role === 'buyer' && (
          <>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{
                padding: 3, textAlign: 'center'
              }}>
                <Typography variant="h2">📋</Typography>
                <Typography variant="h6" gutterBottom>
                  IMS Dashboard
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  Accept or Reject invoices
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate('/ims')}
                  sx={{ mt: 1 }}
                >
                  View Invoices
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{
                padding: 3, textAlign: 'center'
              }}>
                <Typography variant="h2">💰</Typography>
                <Typography variant="h6" gutterBottom>
                  GSTR-3B
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                >
                  View tax liability and ITC
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  onClick={() => navigate('/gstr3b')}
                  sx={{ mt: 1 }}
                >
                  View GSTR-3B
                </Button>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}

export default Dashboard;
