import React, { Component } from 'react';
import axios from 'axios';

export default class Homepage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: '',
      selectedDistrict: '',
      selectedCity: '',
      selectedMinPrice: '',
      selectedMaxPrice: '',
      pendingCategory: '',
      pendingDistrict: '',
      pendingCity: '',
      pendingMinPrice: '',
      pendingMaxPrice: '',
      searchQuery: '',
      sortBy: 'default', // default, price-low-high, price-high-low, name-a-z, name-z-a
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

  // Fisher-Yates shuffle algorithm to randomize array order
  shuffleArray = (array) => {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  fetchListings = () => {
    this.setState({ isLoading: true });
    
    axios.get('http://localhost:3000/listings')
      .then(response => {
        console.log('Listings fetched successfully:', response.data);
        // Randomize the order of listings on every page visit
        const randomizedListings = this.shuffleArray(response.data);
        
        this.setState({
          listings: randomizedListings,
          filteredListings: randomizedListings,
          isLoading: false,
          error: null
        }, () => {
          // Apply initial sorting if any is selected
          if (this.state.sortBy !== 'default') {
            this.filterAndSortListings();
          }
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
    this.setState({ pendingCategory: category });
  }

  handleDistrictChange = (e) => {
    const district = e.target.value;
    this.setState({ 
      pendingDistrict: district,
      pendingCity: '' // Reset city when district changes
    });
  }

  handleCityChange = (e) => {
    const city = e.target.value;
    this.setState({ pendingCity: city });
  }

  handleMinPriceChange = (e) => {
    const price = e.target.value;
    this.setState({ pendingMinPrice: price });
  }

  handleMaxPriceChange = (e) => {
    const price = e.target.value;
    this.setState({ pendingMaxPrice: price });
  }

  handleSortChange = (e) => {
    const sortBy = e.target.value;
    this.setState({ sortBy: sortBy }, () => {
      this.filterAndSortListings();
    });
  }

  handleSearchChange = (e) => {
    const searchQuery = e.target.value;
    this.setState({ searchQuery: searchQuery }, () => {
      this.filterAndSortListings();
    });
  }

  applyFilters = () => {
    this.setState({
      selectedCategory: this.state.pendingCategory,
      selectedDistrict: this.state.pendingDistrict,
      selectedCity: this.state.pendingCity,
      selectedMinPrice: this.state.pendingMinPrice,
      selectedMaxPrice: this.state.pendingMaxPrice
    }, this.filterAndSortListings);
  }

  filterAndSortListings = () => {
    let filtered = this.state.listings;

    // Apply search filter
    if (this.state.searchQuery) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.name.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (this.state.selectedCategory) {
      filtered = filtered.filter(listing => listing.category === this.state.selectedCategory);
    }

    if (this.state.selectedDistrict) {
      filtered = filtered.filter(listing => listing.district === this.state.selectedDistrict);
    }

    if (this.state.selectedCity) {
      filtered = filtered.filter(listing => listing.city === this.state.selectedCity);
    }

    // Apply price filters
    if (this.state.selectedMinPrice) {
      filtered = filtered.filter(listing => listing.pricePerDay >= parseFloat(this.state.selectedMinPrice));
    }

    if (this.state.selectedMaxPrice) {
      filtered = filtered.filter(listing => listing.pricePerDay <= parseFloat(this.state.selectedMaxPrice));
    }

    // Apply sorting
    switch (this.state.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
        break;
      case 'price-low-high':
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'name-a-z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-z-a':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep randomized order for 'default'
        break;
    }

    this.setState({ filteredListings: filtered });
  }

  clearFilters = () => {
    this.setState({
      selectedCategory: '',
      selectedDistrict: '',
      selectedCity: '',
      selectedMinPrice: '',
      selectedMaxPrice: '',
      pendingCategory: '',
      pendingDistrict: '',
      pendingCity: '',
      pendingMinPrice: '',
      pendingMaxPrice: '',
      searchQuery: '',
      sortBy: 'default',
      filteredListings: this.state.listings
    });
  }

  // Check if there are pending filter changes
  hasPendingChanges = () => {
    return this.state.pendingCategory !== this.state.selectedCategory || 
           this.state.pendingDistrict !== this.state.selectedDistrict ||
           this.state.pendingCity !== this.state.selectedCity ||
           this.state.pendingMinPrice !== this.state.selectedMinPrice ||
           this.state.pendingMaxPrice !== this.state.selectedMaxPrice;
  }

  // Check if any filters are currently applied
  hasActiveFilters = () => {
    return this.state.selectedCategory !== '' || 
           this.state.selectedDistrict !== '' || 
           this.state.selectedCity !== '' ||
           this.state.selectedMinPrice !== '' ||
           this.state.selectedMaxPrice !== '' ||
           this.state.searchQuery !== '' ||
           this.state.sortBy !== 'default';
  }

  getUniqueDistricts = () => {
    return [...new Set(this.state.listings.map(listing => listing.district))].sort();
  }

  getUniqueCities = () => {
    if (!this.state.pendingDistrict) {
      return [];
    }
    return [...new Set(
      this.state.listings
        .filter(listing => listing.district === this.state.pendingDistrict)
        .map(listing => listing.city)
    )].sort();
  }

  // Check if user can create listings
  canCreateListing = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    return isLoggedIn && userType === 'renter';
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
      <div className="container-fluid mt-4 mb-5 pb-4">
        {/* Available Listings Title - Centered */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center">
              <h2 className="text-center mb-0">Available Listings</h2>
              {this.canCreateListing() && (
                <button 
                  className="btn btn-primary ms-4"
                  onClick={() => window.location.href = '/create-listing'}
                >
                  <i className="fas fa-plus me-2"></i>Create Your Listing
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Full Width */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Search listings by name, description, or category..."
                    value={this.state.searchQuery}
                    onChange={this.handleSearchChange}
                  />
                  {this.state.searchQuery && (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => this.setState({ searchQuery: '' }, this.filterAndSortListings)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
                {this.state.searchQuery && (
                  <small className="text-muted mt-2 d-block">
                    <i className="fas fa-info-circle me-1"></i>
                    Searching for: "{this.state.searchQuery}"
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Side - Filters */}
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-filter me-2"></i>Sort & Filter
                </h5>
              </div>
              <div className="card-body">
                {/* Sort By */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-sort me-2"></i>Sort By
                  </label>
                  <select 
                    className="form-select"
                    value={this.state.sortBy}
                    onChange={this.handleSortChange}
                  >
                    <option value="default">📅 Default (Random)</option>
                    <option value="newest">⏰ Newest First</option>
                    <option value="oldest">⏰ Oldest First</option>
                    <option value="price-low-high">💰 Price: Low to High</option>
                    <option value="price-high-low">💸 Price: High to Low</option>
                    <option value="name-a-z">🔤 Name: A to Z</option>
                    <option value="name-z-a">🔤 Name: Z to A</option>
                  </select>
                </div>

                <hr />

                {/* Price Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-dollar-sign me-2"></i>Price Range (per day)
                  </label>
                  <div className="row">
                    <div className="col-6">
                      <input 
                        type="number"
                        className="form-control"
                        placeholder="Min $"
                        value={this.state.pendingMinPrice}
                        onChange={this.handleMinPriceChange}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-6">
                      <input 
                        type="number"
                        className="form-control"
                        placeholder="Max $"
                        value={this.state.pendingMaxPrice}
                        onChange={this.handleMaxPriceChange}
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-tags me-2"></i>Category
                  </label>
                  <select 
                    className="form-select"
                    value={this.state.pendingCategory}
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

                {/* District Filter */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-map-marker-alt me-2"></i>District
                  </label>
                  <select 
                    className="form-select"
                    value={this.state.pendingDistrict}
                    onChange={this.handleDistrictChange}
                  >
                    <option value="">All Districts</option>
                    {this.getUniqueDistricts().map(district => (
                      <option key={district} value={district}>🏛️ {district}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter - only show when district is selected */}
                {this.state.pendingDistrict && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-city me-2"></i>City
                    </label>
                    <select 
                      className="form-select"
                      value={this.state.pendingCity}
                      onChange={this.handleCityChange}
                    >
                      <option value="">All Cities in {this.state.pendingDistrict}</option>
                      {this.getUniqueCities().map(city => (
                        <option key={city} value={city}>🏙️ {city}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Apply Filters Button - only show when there are pending changes */}
                {this.hasPendingChanges() && (
                  <button 
                    className="btn btn-primary w-100 mb-3"
                    onClick={this.applyFilters}
                  >
                    <i className="fas fa-check me-2"></i>Apply Filters
                  </button>
                )}

                {/* Clear Filters Button - only show when filters are applied */}
                {this.hasActiveFilters() && (
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={this.clearFilters}
                  >
                    <i className="fas fa-times me-2"></i>Clear Filters
                  </button>
                )}

                {/* Results Count */}
                <div className="mt-3 text-muted small">
                  Showing {this.state.filteredListings.length} of {this.state.listings.length} listings
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Listings */}
          <div className="col-md-9">
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
                          <span className="badge bg-secondary me-2">
                            <i className="fas fa-map-marker-alt me-1"></i>{listing.district}
                          </span>
                          <span className="badge bg-info">
                            <i className="fas fa-city me-1"></i>{listing.city}
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
