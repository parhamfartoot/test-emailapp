import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import { API_BASE_URL } from '../../config';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  
  const navigate = useNavigate();
  
  // Test API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/test`);
        setApiStatus({
          connected: true,
          url: API_BASE_URL,
          message: response.data.message,
          timestamp: response.data.timestamp
        });
      } catch (err) {
        console.error('API connection test failed:', err);
        setApiStatus({
          connected: false,
          url: API_BASE_URL,
          error: err.message
        });
      }
    };
    
    testApiConnection();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, credentials);
      
      // Save token to localStorage
      localStorage.setItem('adminToken', response.data.token);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-login-container">
      <div className="login-box">
        <h1 className="login-title">Admin Login</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {apiStatus && (
          <div className={`api-status ${apiStatus.connected ? 'connected' : 'disconnected'}`}>
            <p>API Status: {apiStatus.connected ? 'Connected' : 'Disconnected'}</p>
            <p>URL: {apiStatus.url}</p>
            {apiStatus.connected ? (
              <p>Message: {apiStatus.message}</p>
            ) : (
              <p>Error: {apiStatus.error}</p>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 