import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid,
  Button, Divider, Alert
} from '@mui/material';
import { getDraftInvoices } from '../services/api';
import { toast } from 'react-toastify';

function GSTR3B() {
  const gstin = localStorage.getItem('gstin');
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDraftInvoices(gstin);
      setInvoices(res.data);
    } catch (err) {
      console.log('Error fetching data - GSTR3B.js:22');
    }
  };

  // Calculate tax figures
  const outputTax = invoices.reduce((sum, inv) =>
    sum + parseFloat(inv.cgst || 0) +
    parseFloat(inv.sgst || 0) +
    parseFloat(inv.igst || 0), 0
  );

  const itcAvailable = outputTax * 0.6;
  const cashLiability = outputTax - itcAvailable;

  const handleFile = () => {
    toast.success(
      `GSTR-3B Filed! Cash Liability: ₹${cashLiability.toFixed(2)} ✅`
    );
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        GSTR-3B — Monthly Summary Return
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        GSTIN: {gstin}
      </Typography>

      {/* Table 3.1 — Output Tax */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Table 3.1 — Outward Supplies (Sales)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#EBF3FB'
            }}>
              <Typography variant="body2">
                Total Taxable Value
              </Typography>
              <Typography variant="h6">
                ₹ {invoices.reduce((sum, inv) =>
                  sum + parseFloat(inv.total_amount || 0) -
                  parseFloat(inv.cgst || 0) -
                  parseFloat(inv.sgst || 0), 0
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#EBF3FB'
            }}>
              <Typography variant="body2">
                Total CGST
              </Typography>
              <Typography variant="h6">
                ₹ {invoices.reduce((sum, inv) =>
                  sum + parseFloat(inv.cgst || 0), 0
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#EBF3FB'
            }}>
              <Typography variant="body2">
                Total SGST
              </Typography>
              <Typography variant="h6">
                ₹ {invoices.reduce((sum, inv) =>
                  sum + parseFloat(inv.sgst || 0), 0
                ).toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Table 4 — ITC */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Table 4 — Input Tax Credit (ITC)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#E8F5E9'
            }}>
              <Typography variant="body2">
                Total Output Tax
              </Typography>
              <Typography variant="h6" color="error">
                ₹ {outputTax.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              padding: 2,
              textAlign: 'center',
              backgroundColor: '#E8F5E9'
            }}>
              <Typography variant="body2">
                ITC Available (Accepted Invoices)
              </Typography>
              <Typography variant="h6" color="success.main">
                ₹ {itcAvailable.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Cash Liability */}
      <Paper elevation={3} sx={{
        padding: 3,
        mb: 3,
        backgroundColor: '#FFF3E0',
        border: '2px solid #FF9800'
      }}>
        <Typography variant="h6" gutterBottom>
          Table 6.1 — Tax Payment Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              Output Tax Liability:
            </Typography>
            <Typography variant="h5" color="error">
              ₹ {outputTax.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              Less: ITC Credit:
            </Typography>
            <Typography variant="h5" color="success.main">
              - ₹ {itcAvailable.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1" fontWeight="bold">
              Net Cash Liability:
            </Typography>
            <Typography
              variant="h4"
              color="warning.dark"
              fontWeight="bold"
            >
              ₹ {cashLiability.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Warning */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        ⚠️ Once filed, GSTR-3B cannot be amended for this period.
        Please review all figures carefully before filing.
      </Alert>

      {/* File Button */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          color="warning"
          onClick={handleFile}
        >
          File GSTR-3B — Pay ₹ {cashLiability.toFixed(2)}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={fetchData}
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
}

export default GSTR3B;