import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid,
  Button, Chip, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

function InvoiceView() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const [actionTaken, setActionTaken] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/invoices/view/${token}`
      );
      setInvoice(res.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invoice not found!'
      );
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const gstin = localStorage.getItem('gstin')
      || invoice?.buyer_gstin;

    setActionLoading(true);
    try {
      await axios.post(
        'http://localhost:8000/api/ims/action',
        {
          irn: invoice.invoice_number,
          buyer_gstin: gstin,
          action: action,
          action_reason: `${action} via WhatsApp link`
        }
      );
      setActionDone(true);
      setActionTaken(action);
      toast.success(`✅ Invoice ${action}ed successfully!`);
    } catch (err) {
      toast.error(
        err.response?.data?.detail
        || 'Error processing action!'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">
          Loading invoice...
        </Typography>
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 2
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%'
        }}>
          <Typography variant="h1">❌</Typography>
          <Typography
            variant="h5"
            color="error"
            gutterBottom
          >
            Invoice Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => window.location.href = '/'}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  const taxable = (
    parseFloat(invoice.total_amount) -
    parseFloat(invoice.cgst) -
    parseFloat(invoice.sgst)
  ).toFixed(2);

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: { xs: 2, md: 4 }
    }}>

      {/* Header */}
      <Paper elevation={3} sx={{
        padding: 3,
        mb: 3,
        background:
          'linear-gradient(135deg, #1565C0, #42A5F5)',
        color: 'white',
        borderRadius: 2
      }}>
        <Typography variant="h4" fontWeight="bold">
          CleariFy
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          GST Invoice — View & Respond
        </Typography>
      </Paper>

      {/* Success Banner */}
      {actionDone && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          variant="filled"
        >
          ✅ You have {actionTaken}ed this invoice.
          Your response is recorded in the GST system.
        </Alert>
      )}

      {/* Invoice Header */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Invoice #{invoice.invoice_number}
            </Typography>
            <Typography color="text.secondary">
              📅 Date: {invoice.invoice_date}
            </Typography>
          </Box>
          <Chip
            label={invoice.status?.toUpperCase()}
            color="warning"
            sx={{ fontSize: '1rem', padding: 1 }}
          />
        </Box>
      </Paper>

      {/* Party Details */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          🏢 Party Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{
              padding: 2,
              backgroundColor: '#EBF3FB',
              borderRadius: 1,
              border: '1px solid #90CAF9'
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                🏪 SELLER GSTIN
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
              >
                {invoice.seller_gstin}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{
              padding: 2,
              backgroundColor: '#E8F5E9',
              borderRadius: 1,
              border: '1px solid #A5D6A7'
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                🛒 BUYER GSTIN (YOU)
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
              >
                {invoice.buyer_gstin}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tax Breakdown */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          💰 Tax Breakdown
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={{
              padding: 2,
              textAlign: 'center',
              border: '1px solid #eee',
              borderRadius: 1
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Taxable Amount
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {taxable}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{
              padding: 2,
              textAlign: 'center',
              border: '1px solid #eee',
              borderRadius: 1
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                CGST
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {invoice.cgst}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{
              padding: 2,
              textAlign: 'center',
              border: '1px solid #eee',
              borderRadius: 1
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                SGST
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹ {invoice.sgst}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#E8F5E9',
              borderRadius: 1,
              border: '2px solid #4CAF50'
            }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Grand Total
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="success.main"
              >
                ₹ {invoice.total_amount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      {!actionDone ? (
        <Paper elevation={3} sx={{
          padding: 3,
          mb: 3,
          border: '2px solid #1565C0',
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            📋 Your Response Required
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Please review the invoice carefully and
            select your response. This will be recorded
            in the GST portal immediately.
          </Typography>

          <Grid container spacing={2}>
            {/* Accept */}
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                disabled={actionLoading}
                onClick={() => handleAction('accept')}
                sx={{
                  height: 70,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                ✅ Accept Invoice
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                ITC will be claimed in GSTR-2B
              </Typography>
            </Grid>

            {/* Reject */}
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                disabled={actionLoading}
                onClick={() => handleAction('reject')}
                sx={{
                  height: 70,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                ❌ Reject Invoice
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                Invoice will be disputed
              </Typography>
            </Grid>

            {/* Pending */}
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                size="large"
                disabled={actionLoading}
                onClick={() => handleAction('pending')}
                sx={{
                  height: 70,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                ⏳ Mark Pending
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 1 }}
              >
                Decide later
              </Typography>
            </Grid>
          </Grid>

          {actionLoading && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                Processing...
              </Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Paper elevation={3} sx={{
          padding: 4,
          textAlign: 'center',
          backgroundColor: '#E8F5E9',
          border: '2px solid #4CAF50',
          borderRadius: 2
        }}>
          <Typography variant="h2">
            {actionTaken === 'accept' ? '✅'
              : actionTaken === 'reject' ? '❌' : '⏳'}
          </Typography>
          <Typography
            variant="h5"
            color="success.main"
            fontWeight="bold"
            gutterBottom
          >
            Response Recorded!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            You have <strong>{actionTaken}ed</strong> this invoice.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            This action is saved in the GST system
            and the seller has been notified.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </Paper>
      )}

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          🔒 Secured by CleariFy GST Platform
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This link is unique and valid for this invoice only
        </Typography>
      </Box>
    </Box>
  );
}

export default InvoiceView;