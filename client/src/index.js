import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// We'll skip importing index.css since it doesn't exist
import AppHome from './components/homepage/Homepage';
import EmailForm from './components/formfile/FormFile';
import PromiseTree from './components/promisetree/PromiseTree';
import Login from './components/admin/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<AppHome />} />
      <Route path="/email-form" element={<EmailForm />} />
      <Route path="/promise-tree" element={<PromiseTree />} />
      <Route path="/admin" element={<Login />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  </Router>
);

