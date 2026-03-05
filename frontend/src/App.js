import React from 'react';
import {
  BrowserRouter as Router,
  Routes, Route
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewInvoice from './pages/NewInvoice';
import IMSDashboard from './pages/IMSDashboard';
import GSTR1 from './pages/GSTR1';
import GSTR3B from './pages/GSTR3B';
import InvoiceView from './pages/InvoiceView';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Public invoice link — no login needed */}
        <Route
          path="/invoice/:token"
          element={<InvoiceView />}
        />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/new-invoice" element={
          <ProtectedRoute><NewInvoice /></ProtectedRoute>
        } />
        <Route path="/ims" element={
          <ProtectedRoute><IMSDashboard /></ProtectedRoute>
        } />
        <Route path="/gstr1" element={
          <ProtectedRoute><GSTR1 /></ProtectedRoute>
        } />
        <Route path="/gstr3b" element={
          <ProtectedRoute><GSTR3B /></ProtectedRoute>
        } />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </Router>
  );
}

export default App;