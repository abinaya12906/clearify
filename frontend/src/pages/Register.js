import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography,
  Paper, Grid, MenuItem, Stepper,
  Step, StepLabel, CircularProgress,
  Divider, Alert
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

// Indian States list
const STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

const BUSINESS_TYPES = [
  'Proprietorship',
  'Partnership',
  'Private Limited Company',
  'Public Limited Company',
  'LLP',
  'Trust',
  'Society',
  'Government Entity'
];

function Register() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Step 1 — Business Details
  const [gstin, setGstin] = useState('');
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [state, setState] = useState('');

  // Step 2 — Contact Details
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');

  // Step 3 — Account Setup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('seller');

  const steps = [
    '🏢 Business Details',
    '📞 Contact Details',
    '🔐 Account Setup'
  ];

  // Validate GSTIN format
  const validateGSTIN = (value) => {
    const pattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return pattern.test(value);
  };

  // Auto detect state from GSTIN
  const handleGSTINChange = (value) => {
    const upper = value.toUpperCase();
    setGstin(upper);
    if (upper.length >= 2) {
      const stateCode = upper.substring(0, 2);
      const found = STATES.find(s => s.code === stateCode);
      if (found) setState(found.name);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!gstin || gstin.length !== 15) {
      toast.error('Enter valid 15 character GSTIN!');
      return false;
    }
    if (!validateGSTIN(gstin)) {
      toast.error('Invalid GSTIN format!');
      return false;
    }
    if (!legalName.trim()) {
      toast.error('Enter legal business name!');
      return false;
    }
    if (!businessType) {
      toast.error('Select business type!');
      return false;
    }
    if (!state) {
      toast.error('Select state!');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!email.trim()) {
      toast.error('Enter email address!');
      return false;
    }
    if (!email.includes('@')) {
      toast.error('Enter valid email!');
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error('Enter valid 10 digit phone!');
      return false;
    }
    if (!address.trim()) {
      toast.error('Enter business address!');
      return false;
    }
    if (!city.trim()) {
      toast.error('Enter city!');
      return false;
    }
    if (!pincode || pincode.length !== 6) {
      toast.error('Enter valid 6 digit pincode!');
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:8000/api/auth/register',
        {
          gstin,
          legal_name: legalName,
          trade_name: tradeName || legalName,
          business_type: businessType,
          state,
          email,
          phone,
          address,
          city,
          pincode,
          password,
          role
        }
      );

      setRegistered(true);
      toast.success('✅ Registration successful!');

    } catch (err) {
      if (!err.response) {
        toast.error('❌ Server not running!');
      } else {
        toast.error(
          `❌ ${err.response.data.detail || 'Registration failed!'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Success Page
  if (registered) {
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
          textAlign: 'center',
          borderRadius: 2
        }}>
          <Typography variant="h1">🎉</Typography>
          <Typography
            variant="h4"
            color="success.main"
            fontWeight="bold"
            gutterBottom
          >
            Welcome to CleariFy!
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
          >
            {legalName}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            GSTIN: {gstin}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Your account has been created successfully!
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ You can now login with your GSTIN
            and password.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{ height: 50 }}
          >
            🔐 Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: 2
    }}>
      <Paper elevation={4} sx={{
        padding: 4,
        width: '100%',
        maxWidth: 600,
        borderRadius: 2
      }}>
        {/* Header */}
        <Typography
          variant="h4"
          align="center"
          color="primary"
          fontWeight="bold"
          gutterBottom
        >
          CleariFy
        </Typography>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
        >
          Create New Account
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Register your business on GST platform
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1 — Business Details */}
        {activeStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="GSTIN *"
                value={gstin}
                onChange={(e) =>
                  handleGSTINChange(e.target.value)
                }
                placeholder="Ex: 27AAPFU0939F1ZV"
                inputProps={{ maxLength: 15 }}
                helperText={
                  gstin.length === 15
                    ? validateGSTIN(gstin)
                      ? '✅ Valid GSTIN format'
                      : '❌ Invalid GSTIN format'
                    : `${gstin.length}/15 characters`
                }
                error={
                  gstin.length === 15 && !validateGSTIN(gstin)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legal Business Name *"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ex: ABC Traders Private Limited"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trade Name (Optional)"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ex: ABC Traders"
                helperText="Name used for business (if different)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Business Type *"
                value={businessType}
                onChange={(e) =>
                  setBusinessType(e.target.value)
                }
              >
                {BUSINESS_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="State *"
                value={state}
                onChange={(e) => setState(e.target.value)}
                helperText="Auto-detected from GSTIN"
              >
                {STATES.map(s => (
                  <MenuItem key={s.code} value={s.name}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* STEP 2 — Contact Details */}
        {activeStep === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abc@company.com"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
                helperText={`${phone.length}/10 digits`}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Address *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No, Street Name, Area"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Mumbai"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pincode *"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Ex: 400001"
                inputProps={{ maxLength: 6 }}
                helperText={`${pincode.length}/6 digits`}
              />
            </Grid>
          </Grid>
        )}

        {/* STEP 3 — Account Setup */}
        {activeStep === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                ℹ️ You will use your GSTIN and this
                password to login to CleariFy.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Register As *"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="seller">
                  🏪 Seller — I create and send invoices
                </MenuItem>
                <MenuItem value="buyer">
                  🛒 Buyer — I receive and approve invoices
                </MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Create Password *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Minimum 6 characters"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password *"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                error={
                  confirmPassword.length > 0 &&
                  password !== confirmPassword
                }
                helperText={
                  confirmPassword.length > 0 &&
                  password !== confirmPassword
                    ? '❌ Passwords do not match'
                    : confirmPassword.length > 0
                    ? '✅ Passwords match'
                    : ''
                }
              />
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
              >
                Registration Summary:
              </Typography>
              <Box sx={{
                padding: 2,
                backgroundColor: '#EBF3FB',
                borderRadius: 1
              }}>
                <Typography variant="body2">
                  🏢 <b>Business:</b> {legalName}
                </Typography>
                <Typography variant="body2">
                  📋 <b>GSTIN:</b> {gstin}
                </Typography>
                <Typography variant="body2">
                  📍 <b>State:</b> {state}
                </Typography>
                <Typography variant="body2">
                  📧 <b>Email:</b> {email}
                </Typography>
                <Typography variant="body2">
                  📱 <b>Phone:</b> {phone}
                </Typography>
                <Typography variant="body2">
                  👤 <b>Role:</b> {role}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Navigation Buttons */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 4,
          gap: 2
        }}>
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={
              activeStep === 0
                ? () => navigate('/')
                : handleBack
            }
            sx={{ minWidth: 120 }}
          >
            {activeStep === 0 ? '← Login' : '← Back'}
          </Button>

          {/* Next / Register Button */}
          {activeStep < 2 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ minWidth: 120 }}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleRegister}
              disabled={loading}
              sx={{ minWidth: 180 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '✅ Register Now'
              )}
            </Button>
          )}
        </Box>

        {/* Login Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3 }}
          color="text.secondary"
        >
          Already have account?{' '}
          <Button
            size="small"
            onClick={() => navigate('/')}
          >
            Login here
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;