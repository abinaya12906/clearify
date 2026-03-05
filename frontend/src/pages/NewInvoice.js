import React, { useState } from 'react';
import {
  Box, Button, TextField,
  Typography, Paper, Grid, MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

function NewInvoice() {
  const sellerGstin = localStorage.getItem('gstin') || '';
  const [buyerGstin, setBuyerGstin] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [gstinValid, setGstinValid] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [items, setItems] = useState([{
    description: '',
    hsn: '',
    qty: 1,
    unitPrice: 0,
    gstRate: 18
  }]);

  // Validate GSTIN format
  const validateGstin = () => {
    const pattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (pattern.test(buyerGstin)) {
      setGstinValid(true);
      toast.success('✅ GSTIN format is valid!');
    } else {
      setGstinValid(false);
      toast.error('❌ Invalid GSTIN format!');
    }
  };

  // Update item field
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Add new item
  const addItem = () => {
    setItems([...items, {
      description: '',
      hsn: '',
      qty: 1,
      unitPrice: 0,
      gstRate: 18
    }]);
  };

  // Remove item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const getTotals = () => {
    let taxable = 0, tax = 0;
    items.forEach(item => {
      const amt =
        (parseFloat(item.qty) || 0) *
        (parseFloat(item.unitPrice) || 0);
      taxable += amt;
      tax += (amt * (parseFloat(item.gstRate) || 0)) / 100;
    });
    return {
      taxable: taxable.toFixed(2),
      cgst: (tax / 2).toFixed(2),
      sgst: (tax / 2).toFixed(2),
      total: (taxable + tax).toFixed(2)
    };
  };

  const totals = getTotals();

  // Save invoice
  const handleSave = async () => {
    if (!invoiceNumber) {
      toast.error('Please enter invoice number!');
      return;
    }
    if (!invoiceDate) {
      toast.error('Please select invoice date!');
      return;
    }
    if (!buyerGstin) {
      toast.error('Please enter buyer GSTIN!');
      return;
    }
    if (!gstinValid) {
      toast.error('Please verify buyer GSTIN first!');
      return;
    }
    if (!items[0].description) {
      toast.error('Please enter item description!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:8000/api/invoices/draft',
        {
          invoice_number: invoiceNumber,
          seller_gstin: sellerGstin,
          buyer_gstin: buyerGstin,
          buyer_phone: buyerPhone || null,
          invoice_date: invoiceDate,
          total_amount: parseFloat(totals.total),
          cgst: parseFloat(totals.cgst),
          sgst: parseFloat(totals.sgst),
          igst: 0.0
        }
      );

      toast.success('✅ Invoice saved! Share link ready.');

      // Store share data for WhatsApp
      setShareData({
        link: res.data.share_link,
        whatsapp: res.data.whatsapp_link,
        number: res.data.invoice_number
      });

      // Reset form
      setInvoiceNumber('');
      setInvoiceDate('');
      setBuyerGstin('');
      setBuyerPhone('');
      setGstinValid(null);
      setItems([{
        description: '',
        hsn: '',
        qty: 1,
        unitPrice: 0,
        gstRate: 18
      }]);

    } catch (err) {
      if (!err.response) {
        toast.error('❌ Backend not running! Start uvicorn.');
      } else if (err.response.status === 400) {
        toast.error(`❌ ${err.response.data.detail}`);
      } else {
        toast.error(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Invoice
      </Typography>

      {/* Party Details */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Party Details
        </Typography>
        <Grid container spacing={2}>

          {/* Seller GSTIN */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Seller GSTIN"
              value={sellerGstin}
              disabled
              helperText="Auto-filled from your login"
            />
          </Grid>

          {/* Buyer GSTIN */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buyer GSTIN *"
              value={buyerGstin}
              onChange={(e) => {
                setBuyerGstin(e.target.value.toUpperCase());
                setGstinValid(null);
              }}
              placeholder="Ex: 29AABCT1332L1ZT"
              inputProps={{ maxLength: 15 }}
              error={gstinValid === false}
              helperText={
                gstinValid === true
                  ? '✅ Valid GSTIN'
                  : gstinValid === false
                  ? '❌ Invalid GSTIN format'
                  : 'Enter 15 character GSTIN'
              }
            />
          </Grid>

          {/* Verify Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={validateGstin}
              sx={{ height: 56 }}
            >
              Verify
            </Button>
          </Grid>

          {/* Buyer WhatsApp Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buyer WhatsApp Number 📱"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="Ex: 919876543210"
              helperText="With country code — Ex: 919876543210 (India: 91 + number)"
            />
          </Grid>

          {/* Invoice Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Invoice Number *"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Ex: INV-2024-001"
              helperText="Must be unique for each invoice"
            />
          </Grid>

          {/* Invoice Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Invoice Date *"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

        </Grid>
      </Paper>

      {/* Invoice Items */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Invoice Items
        </Typography>

        {items.map((item, index) => (
          <Box key={index} sx={{
            mb: 3,
            pb: 2,
            borderBottom: index < items.length - 1
              ? '1px solid #eee' : 'none'
          }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Item {index + 1}
            </Typography>
            <Grid container spacing={2}>

              {/* Description */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Description *"
                  value={item.description}
                  onChange={(e) => updateItem(
                    index, 'description', e.target.value
                  )}
                  placeholder="Product or Service name"
                />
              </Grid>

              {/* HSN Code */}
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="HSN Code"
                  value={item.hsn}
                  onChange={(e) => updateItem(
                    index, 'hsn', e.target.value
                  )}
                  placeholder="Ex: 8471"
                />
              </Grid>

              {/* Quantity */}
              <Grid item xs={6} md={1}>
                <TextField
                  fullWidth
                  label="Qty"
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(
                    index, 'qty', e.target.value
                  )}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Unit Price */}
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Price ₹"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(
                    index, 'unitPrice', e.target.value
                  )}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* GST Rate */}
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="GST %"
                  value={item.gstRate}
                  onChange={(e) => updateItem(
                    index, 'gstRate', e.target.value
                  )}
                >
                  {[0, 5, 12, 18, 28].map(r => (
                    <MenuItem key={r} value={r}>
                      {r}%
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Amount */}
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Amount ₹"
                  value={(
                    (parseFloat(item.qty) || 0) *
                    (parseFloat(item.unitPrice) || 0)
                  ).toFixed(2)}
                  disabled
                />
              </Grid>

            </Grid>

            {/* Remove Item Button */}
            {items.length > 1 && (
              <Button
                color="error"
                size="small"
                onClick={() => removeItem(index)}
                sx={{ mt: 1 }}
              >
                ❌ Remove Item
              </Button>
            )}
          </Box>
        ))}

        <Button
          variant="outlined"
          onClick={addItem}
          sx={{ mt: 1 }}
        >
          + Add Another Item
        </Button>
      </Paper>

      {/* Invoice Summary */}
      <Paper elevation={2} sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Invoice Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Taxable Amount"
              value={`₹ ${totals.taxable}`}
              disabled
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="CGST"
              value={`₹ ${totals.cgst}`}
              disabled
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="SGST"
              value={`₹ ${totals.sgst}`}
              disabled
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Grand Total"
              value={`₹ ${totals.total}`}
              disabled
              sx={{
                '& .MuiInputBase-input': {
                  fontWeight: 'bold',
                  color: 'green',
                  fontSize: '1.1rem'
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* WhatsApp Share Section */}
      {shareData && (
        <Paper elevation={3} sx={{
          padding: 3,
          mb: 3,
          border: '2px solid #25D366',
          borderRadius: 2,
          backgroundColor: '#F1FFF1'
        }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: '#25D366' }}
          >
            ✅ Invoice Ready — Send to Buyer via WhatsApp
          </Typography>

          {/* Link Display */}
          <Box sx={{
            padding: 2,
            backgroundColor: 'white',
            borderRadius: 1,
            mb: 2,
            border: '1px solid #ddd',
            wordBreak: 'break-all'
          }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              🔗 Shareable Link:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {shareData.link}
            </Typography>
          </Box>

          {/* Share Buttons */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#25D366',
                '&:hover': { backgroundColor: '#1da851' }
              }}
              onClick={() => window.open(
                shareData.whatsapp, '_blank'
              )}
            >
              💬 Send via WhatsApp
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                navigator.clipboard.writeText(shareData.link);
                toast.success('🔗 Link copied to clipboard!');
              }}
            >
              📋 Copy Link
            </Button>

            <Button
              variant="outlined"
              size="large"
              color="info"
              onClick={() => window.open(
                shareData.link, '_blank'
              )}
            >
              👁️ Preview Invoice
            </Button>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            📱 Buyer opens link on phone →
            sees full invoice → clicks Accept/Reject →
            saved in GST system ✅
          </Typography>
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={loading}
          sx={{ minWidth: 160 }}
        >
          {loading ? 'Saving...' : '💾 Save as Draft'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>

    </Box>
  );
}

export default NewInvoice;