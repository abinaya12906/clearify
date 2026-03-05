import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table,
  TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip
} from '@mui/material';
import { getDraftInvoices } from '../services/api';
import { toast } from 'react-toastify';

function GSTR1() {
  const sellerGstin = localStorage.getItem('gstin');
  const [invoices, setInvoices] = useState([]);
  const [totalTax, setTotalTax] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await getDraftInvoices(sellerGstin);
      setInvoices(res.data);
      const tax = res.data.reduce((sum, inv) =>
        sum + parseFloat(inv.cgst || 0) +
        parseFloat(inv.sgst || 0) +
        parseFloat(inv.igst || 0), 0
      );
      setTotalTax(tax);
    } catch (err) {
      console.log('Error fetching invoices - GSTR1.js:30');
    }
  };

  const handleFilGSTR1 = () => {
    toast.success('GSTR-1 prepared successfully! ✅ Ready to file.');
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        GSTR-1 — Sales Return
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Seller GSTIN: {sellerGstin}
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper elevation={2} sx={{
          padding: 2, textAlign: 'center', flex: 1
        }}>
          <Typography variant="h6" color="primary">
            {invoices.length}
          </Typography>
          <Typography variant="body2">
            Total Invoices
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{
          padding: 2, textAlign: 'center', flex: 1
        }}>
          <Typography variant="h6" color="success.main">
            ₹ {invoices.reduce((sum, inv) =>
              sum + parseFloat(inv.total_amount || 0), 0
            ).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Total Sales Value
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{
          padding: 2, textAlign: 'center', flex: 1
        }}>
          <Typography variant="h6" color="warning.main">
            ₹ {totalTax.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Total Tax Collected
          </Typography>
        </Paper>
      </Box>

      {/* Invoice Table */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1F4E79' }}>
                <TableCell sx={{ color: 'white' }}>
                  Invoice No
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  Buyer GSTIN
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  Taxable Amount
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  CGST
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  SGST
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  Total
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{inv.buyer_gstin}</TableCell>
                    <TableCell>{inv.invoice_date}</TableCell>
                    <TableCell>
                      ₹ {(inv.total_amount -
                        inv.cgst - inv.sgst).toFixed(2)}
                    </TableCell>
                    <TableCell>₹ {inv.cgst}</TableCell>
                    <TableCell>₹ {inv.sgst}</TableCell>
                    <TableCell>₹ {inv.total_amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status?.toUpperCase()}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* File Button */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          color="success"
          onClick={handleFilGSTR1}
        >
          Prepare GSTR-1 ✅
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={fetchInvoices}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
}

export default GSTR1;