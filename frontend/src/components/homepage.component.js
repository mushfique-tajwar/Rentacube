import React, { Component } from 'react';
import axios from 'axios';

export default class Homepage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: '',
      selectedLocation: '',
      listings: [],
      filteredListings: [],
      isLoading: true,
      error: null,
      imageLoadStates: {} // Track loading state of each image
    };
  }

  componentDidMount() {
    this.fetchListings();
  }

  fetchListings = () => {
    this.setState({ isLoading: true });
    
    axios.get('http://localhost:3000/listings')
      .then(response => {
        console.log('Listings fetched successfully:', response.data);
        this.setState({
          listings: response.data,
          filteredListings: response.data,
          isLoading: false,
          error: null
        });
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        this.setState({
          error: 'Failed to load listings. Please try again later.',
          isLoading: false
        });
      });
  }

  handleCategoryChange = (e) => {
    const category = e.target.value;
    this.setState({ selectedCategory: category }, this.filterListings);
  }

  handleLocationChange = (e) => {
    const location = e.target.value;
    this.setState({ selectedLocation: location }, this.filterListings);
  }

  filterListings = () => {
    let filtered = this.state.listings;

    if (this.state.selectedCategory) {
      filtered = filtered.filter(listing => listing.category === this.state.selectedCategory);
    }

    if (this.state.selectedLocation) {
      filtered = filtered.filter(listing => listing.location === this.state.selectedLocation);
    }

    this.setState({ filteredListings: filtered });
  }

  clearFilters = () => {
    this.setState({
      selectedCategory: '',
      selectedLocation: '',
      filteredListings: this.state.listings
    });
  }

  getUniqueLocations = () => {
    return [...new Set(this.state.listings.map(listing => listing.location))].sort();
  }

  // Get image path from database or return null for placeholder
  getImagePath = (listing) => {
    if (!listing || !listing.image) {
      return null;
    }
    return `/images/listings/${listing.image}`;
  }

  // Handle image loading success
  handleImageLoad = (listingId) => {
    this.setState(prevState => ({
      imageLoadStates: {
        ...prevState.imageLoadStates,
        [listingId]: 'loaded'
      }
    }));
  }

  // Handle image loading error
  handleImageError = (listingId) => {
    this.setState(prevState => ({
      imageLoadStates: {
        ...prevState.imageLoadStates,
        [listingId]: 'error'
      }
    }));
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="container-fluid mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading listings...</p>
          </div>
        </div>
      );
    }

    if (this.state.error) {
      return (
        <div className="container-fluid mt-4">
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {this.state.error}
            <button 
              className="btn btn-outline-danger ms-3"
              onClick={this.fetchListings}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid mt-4">
        <div className="row">
          {/* Left Side - Filters */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-filter me-2"></i>Filters
                </h5>
              </div>
              <div className="card-body">
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-tags me-2"></i>Category
                  </label>
                  <select 
                    className="form-select"
                    value={this.state.selectedCategory}
                    onChange={this.handleCategoryChange}
                  >
                    <option value="">All Categories</option>
                    <option value="vehicles">🚗 Vehicles</option>
                    <option value="electronics">📱 Electronics</option>
                    <option value="clothing">👕 Clothing</option>
                    <option value="home">🏠 Home</option>
                    <option value="property">🏢 Property</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="services">🛠️ Services</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-map-marker-alt me-2"></i>Location
                  </label>
                  <select 
                    className="form-select"
                    value={this.state.selectedLocation}
                    onChange={this.handleLocationChange}
                  >
                    <option value="">All Locations</option>
                    {this.getUniqueLocations().map(location => (
                      <option key={location} value={location}>📍 {location}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={this.clearFilters}
                >
                  <i className="fas fa-times me-2"></i>Clear Filters
                </button>

                {/* Results Count */}
                <div className="mt-3 text-muted small">
                  Showing {this.state.filteredListings.length} of {this.state.listings.length} listings
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Listings */}
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Available Listings</h2>
              <button className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Add New Listing
              </button>
            </div>

            {/* Listings Grid */}
            <div className="row">
              {this.state.filteredListings.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info text-center">
                    <i className="fas fa-search me-2"></i>
                    No listings found matching your filters. Try adjusting your search criteria.
                  </div>
                </div>
              ) : (
                this.state.filteredListings.map(listing => (
                  <div key={listing._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      {/* Image or Placeholder */}
                      <div className="position-relative" style={{ paddingTop: '100%', overflow: 'hidden' }}>
                        {this.getImagePath(listing) ? (
                          // Render image when there's an image path in database
                          <>
                            <img 
                              src={this.getImagePath(listing)}
                              alt={listing.name}
                              className="position-absolute"
                              style={{ 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                display: this.state.imageLoadStates[listing._id] === 'error' ? 'none' : 'block'
                              }}
                              onLoad={() => this.handleImageLoad(listing._id)}
                              onError={() => this.handleImageError(listing._id)}
                            />
                            
                            {/* Error placeholder - only show when image fails to load */}
                            {this.state.imageLoadStates[listing._id] === 'error' && (
                              <div 
                                className="bg-light d-flex align-items-center justify-content-center position-absolute"
                                style={{ 
                                  top: 0, 
                                  left: 0, 
                                  width: '100%', 
                                  height: '100%'
                                }}
                              >
                                <div className="text-center text-muted">
                                  <i className="fas fa-image fa-3x mb-2"></i>
                                  <p className="mb-0">Image Failed to Load</p>
                                  <small>{listing.name}</small>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          // Render placeholder when no image path in database
                          <div 
                            className="bg-light d-flex align-items-center justify-content-center position-absolute"
                            style={{ 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%'
                            }}
                          >
                            <div className="text-center text-muted">
                              <i className="fas fa-image fa-3x mb-2"></i>
                              <p className="mb-0">Image Coming Soon</p>
                              <small>{listing.name}</small>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{listing.name}</h5>
                        
                        {/* Category and Location */}
                        <div className="mb-2">
                          <span className="badge bg-primary me-2">
                            {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
                          </span>
                          <span className="badge bg-secondary">
                            <i className="fas fa-map-marker-alt me-1"></i>{listing.location}
                          </span>
                        </div>
                        
                        {/* Price */}
                        <div className="mb-2">
                          <span className="h5 text-success">${listing.pricePerDay}/day</span>
                        </div>
                        
                        {/* Description */}
                        <p className="card-text flex-grow-1">{listing.description}</p>
                        
                        {/* View count */}
                        <div className="mb-2 text-muted small">
                          <i className="fas fa-eye me-1"></i>{listing.views} views
                        </div>
                        
                        {/* View Listing Button */}
                        <button className="btn btn-outline-primary mt-auto">
                          <i className="fas fa-eye me-2"></i>View Listing
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
