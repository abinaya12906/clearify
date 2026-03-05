import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// GSTIN Verification
export const verifyGSTIN = (gstin) => 
  API.get(`/verify-gstin/${gstin}`);

// Invoice APIs
export const createDraftInvoice = (data) => 
  API.post('/invoices/draft', data);

export const getDraftInvoices = (gstin) => 
  API.get(`/invoices/drafts/${gstin}`);

// IMS APIs
export const recordIMSAction = (data) => 
  API.post('/ims/action', data);

export const getBuyerInvoices = (gstin) => 
  API.get(`/ims/invoices/${gstin}`);