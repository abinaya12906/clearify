import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button,
  Grid, Chip
} from '@mui/material';
import { getBuyerInvoices, recordIMSAction } from '../services/api';
import { toast } from 'react-toastify';

function IMSDashboard() {
  const buyerGstin = localStorage.getItem('gstin');
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await getBuyerInvoices(buyerGstin);
      setInvoices(res.data);
    } catch (err) {
      console.log('No invoices yet - IMSDashboard.js:23');
    }
  };

  const handleAction = async (irn, action) => {
    try {
      await recordIMSAction({
        irn,
        buyer_gstin: buyerGstin,
        action,
        reason: null
      });
      toast.success(`Invoice ${action}ed successfully! ✅`);
      fetchInvoices();
    } catch (err) {
      toast.error('Error processing action!');
    }
  };

  const getStatusColor = (action) => {
    if (action === 'accept') return 'success';
    if (action === 'reject') return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        IMS Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Invoice Management System — Buyer: {buyerGstin}
      </Typography>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        {['all', 'pending', 'accept', 'reject'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'contained' : 'outlined'}
            onClick={() => setFilter(f)}
            size="small"
          >
            {f.toUpperCase()}
          </Button>
        ))}
      </Box>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <Paper elevation={2} sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Invoices from sellers will appear here
          </Typography>
        </Paper>
      ) : (
        invoices
          .filter(inv => filter === 'all' || inv.action === filter)
          .map((invoice, index) => (
            <Paper key={index} elevation={2} sx={{ padding: 3, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">
                    IRN: {invoice.irn?.substring(0, 20)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Buyer GSTIN: {invoice.buyer_gstin}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(invoice.action_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Chip
                    label={invoice.action?.toUpperCase() || 'PENDING'}
                    color={getStatusColor(invoice.action)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleAction(invoice.irn, 'accept')}
                    >
                      ✅ Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleAction(invoice.irn, 'reject')}
                    >
                      ❌ Reject
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => handleAction(invoice.irn, 'pending')}
                    >
                      ⏳ Pending
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))
      )}
    </Box>
  );
}

export default IMSDashboard;
