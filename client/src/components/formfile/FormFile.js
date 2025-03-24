import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './formfile.css';
import '../mobile-optimizations.css';
import backgroundVideo from '../../assets/Sun_Bright_Nature_Park_Walking_uhd_1907853.mp4';
import { API_BASE_URL } from '../../config';

const EmailForm = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    promise: '',
    consent: false
  });
  const [status, setStatus] = useState({
    message: '',
    type: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Function to handle scrolling when arrows are clicked
  const handleScroll = useCallback((direction) => {
    if (contentRef.current) {
      const scrollAmount = direction === 'down' ? 300 : -300;
      contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Function to check scroll position and update arrow visibility
  const checkScrollPosition = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    
    // Always show down arrow if content is larger than view area
    const hasMoreContent = scrollHeight > clientHeight;
    // Only hide down arrow when we're very close to the bottom
    setShowScrollDown(hasMoreContent && scrollTop < scrollHeight - clientHeight - 5);
    
    // Show up arrow as soon as we scroll a little
    setShowScrollUp(scrollTop > 5);
  }, []);

  // Function to check device capability
  const checkDeviceCapability = useCallback(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(batteryManager => {
        if (batteryManager.level < 0.15 || batteryManager.charging === false) {
          setIsLowPowerMode(true);
        }
      }).catch(() => {
        checkConnectionSpeed();
      });
    } else {
      checkConnectionSpeed();
    }
  }, []);

  // Check connection speed
  const checkConnectionSpeed = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.saveData || 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g') {
        setIsLowPowerMode(true);
      }
    }
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.promise.trim()) {
      errors.promise = 'Promise is required';
    } else if (formData.promise.length < 10) {
      errors.promise = 'Promise should be at least 10 characters';
    }
    
    if (formData.email.trim() && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.email.trim() && !formData.consent) {
      errors.consent = 'You must consent to receive a reminder for your pledge';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  // Email validation
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      // Check initial scroll position
      checkScrollPosition();
      
      // Add scroll event listener
      content.addEventListener('scroll', checkScrollPosition);
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
      
      // Clean up event listeners on unmount
      return () => {
        content.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [checkScrollPosition, handleResize]);
  
  useEffect(() => {
    // Check device capabilities for video playback
    checkDeviceCapability();
  }, [checkDeviceCapability]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to the first error if on mobile
      if (isMobile) {
        const firstErrorField = document.querySelector('.input-error');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setIsLoading(true);
    setFormLoading(true);
    
    try {
      // Only include email and consent if email is provided
      const submissionData = {
        name: formData.name,
        promise: formData.promise
      };
      
      if (formData.email.trim()) {
        submissionData.email = formData.email;
        submissionData.reminderConsent = formData.consent;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/pledges`, submissionData);
      
      if (response.data.success) {
        setStatus({
          message: 'Your promise has been recorded. Thank you for your commitment!',
          type: 'success'
        });
        setIsSubmitted(true);
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          promise: '',
          consent: false
        });
        
        // Redirect to promise tree after short delay
        setTimeout(() => {
          navigate('/promise-tree');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to submit pledge');
      }
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || err.message || 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setFormLoading(false);
    }
  };

  return (
    <div className="email-form-container earth-theme" ref={containerRef}>
      {formLoading && isMobile && (
        <div className="mobile-loading">
          <p>Sending your promise...</p>
        </div>
      )}
      
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        className={`video-background ${isLowPowerMode ? 'low-power' : ''}`}
        playsInline 
        disablePictureInPicture 
        controlsList="nodownload nofullscreen noremoteplayback" 
        style={{ pointerEvents: 'none' }}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="video-overlay"></div>
      
      <div className="form-content mobile-scroll-container" ref={contentRef}>
        <h2 className="handwritten-title">Make Your Promise</h2>
        
        <div className="form-prompt">
          What is your promise to the Earth?
        </div>
        
        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="promise-form" noValidate>
          <div className={`form-group ${formErrors.name ? 'input-error' : ''}`}>
            <label htmlFor="name">Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
              disabled={isLoading}
              autoComplete="name"
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          
          <div className={`form-group ${formErrors.promise ? 'input-error' : ''}`}>
            <label htmlFor="promise">Your Promise to the Earth *</label>
            <textarea
              id="promise"
              name="promise"
              value={formData.promise}
              onChange={handleChange}
              rows="4"
              required
              aria-required="true"
              disabled={isLoading}
              placeholder="I promise to..."
            ></textarea>
            {formErrors.promise && <div className="error-message">{formErrors.promise}</div>}
          </div>
          
          <div className={`form-group ${formErrors.email ? 'input-error' : ''}`}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
          </div>
          
          <div className={`checkbox-group ${formErrors.consent ? 'input-error' : ''}`}>
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="consent">
              I wish to be reminded of my promise in 2029
            </label>
            {formErrors.consent && <div className="error-message">{formErrors.consent}</div>}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Your Promise'}
          </button>
        </form>
        
        <div className="privacy-notice">
          <p>
            By submitting a promise, you agree that your submission may be displayed publicly as part of 
            the Students' First Supper Digital Time Capsule. If you provide an email, you consent to 
            receiving a one-time reminder in 2029. Submissions that contain hate speech, defamatory 
            content, or unlawful material will be removed at our discretion.
          </p>
        </div>
      </div>
      
      {/* Scroll Indicators */}
      <div 
        className={`scroll-indicator scroll-down ${showScrollDown ? 'visible' : ''}`} 
        onClick={() => handleScroll('down')}
        aria-label="Scroll down"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>
      
      <div 
        className={`scroll-indicator scroll-up ${showScrollUp ? 'visible' : ''}`} 
        onClick={() => handleScroll('up')}
        aria-label="Scroll up"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        </svg>
      </div>
    </div>
  );
};

export default EmailForm;
