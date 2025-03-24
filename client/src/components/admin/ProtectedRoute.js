import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          setRedirect(true);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setRedirect(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, []);
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }
  
  if (redirect) {
    return <Navigate to="/admin" replace />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 