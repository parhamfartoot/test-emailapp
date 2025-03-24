import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundVideo from '../../assets/Sun_Bright_Nature_Park_Walking_uhd_1907853.mp4';
import './admin.css';
import { API_BASE_URL, APP_CONFIG } from '../../config';

const AdminDashboard = () => {
  // State variables
  const [pledges, setPledges] = useState([]);
  const [filteredPledges, setFilteredPledges] = useState([]);
  const [selectedPledge, setSelectedPledge] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const navigate = useNavigate();
  
  // Responsive carousel settings
  const getItemsPerSlide = () => {
    if (windowWidth <= 576) return 1;
    if (windowWidth <= 992) return 2;
    return 3;
  };
  
  // Handle mobile browser chrome (address bar) height changes
  useEffect(() => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    const handleResize = () => {
      // Reset viewport height variable on resize
      vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update window width for carousel
      setWindowWidth(window.innerWidth);
      // Reset to first slide when resizing to avoid empty slides
      setCurrentSlide(0);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Improve iOS scroll behavior for address bar
    const handleTouchMove = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    // Verify token validity
    const verifyToken = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/admin');
      }
    };
    
    verifyToken();
  }, [navigate]);
  
  // Load pledges from API
  const fetchPledges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/admin/pledges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if response has the expected structure
      if (response.data && response.data.success) {
        // Get the pledges data (response might contain data in response.data.data)
        const fetchedPledges = response.data.data || [];
        
        // Sort pledges by date (newest first)
        const sortedPledges = fetchedPledges.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setPledges(sortedPledges);
        setFilteredPledges(sortedPledges);
        setError(null);
      } else {
        // Handle unexpected response structure
        console.error('Unexpected response structure:', response.data);
        setError('Failed to load pledges: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching pledges:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin');
      } else {
        setError(`Failed to load pledges: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a pledge
  const handleDeletePledge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pledge? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      setDeleteSuccess(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin');
        return;
      }
      
      await axios.delete(`${API_BASE_URL}/api/admin/pledges/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove deleted pledge from state
      setPledges(prev => prev.filter(pledge => pledge._id !== id));
      setFilteredPledges(prev => prev.filter(pledge => pledge._id !== id));
      
      // Close detail modal if the deleted pledge was selected
      if (selectedPledge && selectedPledge._id === id) {
        setSelectedPledge(null);
      }
      
      setDeleteSuccess('Pledge deleted successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin');
      } else {
        setDeleteError('Failed to delete pledge. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  // Initial data fetch
  useEffect(() => {
    fetchPledges();
    
    // Set up polling to check for new pledges every 30 seconds
    const intervalId = setInterval(() => {
      fetchPledges();
    }, APP_CONFIG.updateInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter pledges based on search term
  useEffect(() => {
    if (!pledges.length) return;
    
    if (searchQuery === '') {
      setFilteredPledges(pledges);
    } else {
      const filtered = pledges.filter(
        pledge => 
          pledge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pledge.promise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pledge.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPledges(filtered);
    }
    
    // Reset carousel to first slide when search changes
    setCurrentSlide(0);
  }, [searchQuery, pledges]);
  
  // Calculate total number of slides
  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(filteredPledges.length / itemsPerSlide);
  
  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle click on a pledge
  const handlePledgeClick = (pledge) => {
    setSelectedPledge(pledge);
  };

  // Close the pledge details modal
  const closePledgeDetails = () => {
    setSelectedPledge(null);
  };
  
  // Get current visible pledges
  const getCurrentPledges = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return filteredPledges.slice(startIndex, startIndex + itemsPerSlide);
  };

  // Render the carousel content
  const renderCarousel = () => {
    const isMobile = windowWidth <= 576;
    
    // Check if there are no pledges at all
    if (pledges.length === 0) {
      return (
        <div className="no-pledges">
          <p>No pledges have been made yet.</p>
        </div>
      );
    }
    
    // If no pledges found after filtering
    if (filteredPledges.length === 0) {
      return (
        <div className="no-pledges">
          <p>No pledges found matching your search.</p>
        </div>
      );
    }
    
    // Get the current pledges to display
    const currentPledges = getCurrentPledges();
    
    return (
      <div className="carousel-container">
        {!isMobile ? (
          // Desktop view with content wrapper
          <div className="carousel-content-wrapper">
            <button 
              className="carousel-button prev-button" 
              onClick={prevSlide}
              disabled={totalSlides <= 1}
              aria-label="Previous slide"
            >
              &laquo;
            </button>
            
            <div className="carousel-content">
              {currentPledges.map(pledge => (
                <div 
                  key={pledge._id} 
                  className="pledge-card" 
                  onClick={() => handlePledgeClick(pledge)}
                >
                  <div className="card-header">
                    <h3>{pledge.name || 'Anonymous'}</h3>
                    <small>{formatDate(pledge.createdAt)}</small>
                  </div>
                  <div className="card-content">
                    <p>{pledge.promise || 'No details available'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="read-more">View Details</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="carousel-button next-button" 
              onClick={nextSlide}
              disabled={totalSlides <= 1}
              aria-label="Next slide"
            >
              &raquo;
            </button>
          </div>
        ) : (
          // Mobile view with separate controls
          <>
            <div className="carousel-content">
              {currentPledges.map(pledge => (
                <div 
                  key={pledge._id} 
                  className="pledge-card mobile-card" 
                  onClick={() => handlePledgeClick(pledge)}
                >
                  <div className="card-header">
                    <h3>{pledge.name || 'Anonymous'}</h3>
                    <small>{formatDate(pledge.createdAt)}</small>
                  </div>
                  <div className="card-content">
                    <p>{pledge.promise || 'No details available'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="read-more">View Details</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mobile-carousel-controls">
              <button 
                className="carousel-button prev-button" 
                onClick={prevSlide} 
                disabled={totalSlides <= 1}
                aria-label="Previous slide"
              >
                &laquo;
              </button>
              <button 
                className="carousel-button next-button" 
                onClick={nextSlide} 
                disabled={totalSlides <= 1}
                aria-label="Next slide"
              >
                &raquo;
              </button>
            </div>
          </>
        )}
        
        {!isMobile && totalSlides > 1 && (
          <div className="carousel-indicators">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                className={`carousel-indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container">
      <video 
        autoPlay 
        muted 
        loop 
        className="background-video" 
        playsInline 
        disablePictureInPicture 
        controlsList="nodownload nofullscreen noremoteplayback" 
        style={{ pointerEvents: 'none' }}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="content-overlay">
        <div className="main-content mobile-scroll-container">
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          
          <div className="admin-controls">
            <p className="page-description">
              Manage pledges by searching, viewing details, and deleting as needed.
            </p>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search pledges..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>
          
          {deleteSuccess && (
            <div className="success-message">{deleteSuccess}</div>
          )}
          
          {deleteError && (
            <div className="error-message">{deleteError}</div>
          )}
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading pledges...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <button 
                className="retry-button" 
                onClick={fetchPledges}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="pledge-stats">
                <p>Showing {filteredPledges.length} {filteredPledges.length === 1 ? 'pledge' : 'pledges'}</p>
              </div>
              
              <div className="carousel-section">
                {renderCarousel()}
              </div>
            </>
          )}
        </div>
        
        {selectedPledge && (
          <div className="pledge-details-modal" onClick={closePledgeDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closePledgeDetails}>&times;</button>
              <h2>Pledge Details</h2>
              <div className="detail-item">
                <strong>Name:</strong> <span>{selectedPledge.name || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <strong>Pledge:</strong> <span>{selectedPledge.promise || 'No pledge details available'}</span>
              </div>
              <div className="detail-item">
                <strong>Date:</strong> <span>{selectedPledge.createdAt ? formatDate(selectedPledge.createdAt) : 'Unknown date'}</span>
              </div>
              {selectedPledge.email && (
                <div className="detail-item">
                  <strong>Email:</strong> <span>{selectedPledge.email}</span>
                </div>
              )}
              {selectedPledge.reminderConsent !== undefined && (
                <div className="detail-item">
                  <strong>Consent:</strong> <div className="reminder-consent">
                    {selectedPledge.reminderConsent ? 'Has agreed to receive reminders' : 'Has not agreed to receive reminders'}
                  </div>
                </div>
              )}
              
              <div className="admin-actions">
                <button 
                  className="delete-button"
                  onClick={() => handleDeletePledge(selectedPledge._id)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Pledge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 