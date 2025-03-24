import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './formfile.css';
import backgroundVideo from '../../assets/Sun_Bright_Nature_Park_Walking_uhd_1907853.mp4';
import { API_BASE_URL } from '../../config';

const EmailForm = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  
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

  // Function to handle scrolling when arrows are clicked
  const handleScroll = (direction) => {
    if (contentRef.current) {
      const scrollAmount = direction === 'down' ? 300 : -300;
      contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Function to check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    
    // Always show down arrow if content is larger than view area
    const hasMoreContent = scrollHeight > clientHeight;
    // Only hide down arrow when we're very close to the bottom
    setShowScrollDown(hasMoreContent && scrollTop < scrollHeight - clientHeight - 5);
    
    // Show up arrow as soon as we scroll a little
    setShowScrollUp(scrollTop > 5);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      // Check initial scroll position
      checkScrollPosition();
      
      // Add scroll event listener
      content.addEventListener('scroll', checkScrollPosition);
      
      // Clean up event listener on unmount
      return () => {
        content.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.promise) {
      setStatus({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    setStatus({ message: '', type: '' });
    
    const emailData = {
      to: formData.email,
      subject: 'Your Promise to the Earth',
      text: `Dear ${formData.name},\n\nThank you for your commitment to a sustainable future. Your promise: "${formData.promise}"\n\nWe'll remind you of this promise in 2029.\n\nThe First Supper Initiative`,
      // Add pledge data for database storage
      name: formData.name,
      promise: formData.promise,
      consent: formData.consent
    };
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send-email`, 
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setStatus({
        message: 'Your promise has been recorded and added to our Digital Time Capsule!',
        type: 'success'
      });
      setFormData({ name: '', email: '', promise: '', consent: false });
      
      setTimeout(() => {
        navigate('/promise-tree');
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      setStatus({
        message: 'Failed to send promise. Please try again later.',
        type: 'error'
      });
    }
  };

  return (
    <div className="home-container earth-theme" ref={containerRef}>
      <video autoPlay muted loop className="video-background">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay"></div>
      
      <div className="email-form-container" ref={contentRef}>
        <h2 className="handwritten-title">Make Your Promise to the Earth</h2>
        <p className="form-prompt">
          What small action can you take today to transform the food system?
        </p>
        
        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="promise">Your Promise for 2050</label>
            <textarea
              id="promise"
              name="promise"
              placeholder="I promise to..."
              value={formData.promise}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
            />
            <label htmlFor="consent">
              I wish to be reminded of my promise in 2029
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-btn"
          >
            {isLoading ? 'Recording Your Promise...' : 'Submit Your Promise'}
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
