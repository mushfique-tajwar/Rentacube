import React, { Component } from 'react';
import axios from 'axios';

export default class CreateListing extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePriceHourly = this.onChangePriceHourly.bind(this);
    this.onChangePriceDaily = this.onChangePriceDaily.bind(this);
    this.onChangePriceMonthly = this.onChangePriceMonthly.bind(this);
    this.onTogglePricingOption = this.onTogglePricingOption.bind(this);
    this.onChangeDistrict = this.onChangeDistrict.bind(this);
    this.onChangeCity = this.onChangeCity.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onChangeImage = this.onChangeImage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: '',
      description: '',
      pricing: {
        hourly: '',
        daily: '',
        monthly: ''
      },
      pricingOptions: {
        showHourly: false,
        showDaily: false,
        showMonthly: false
      },
      district: '',
      city: '',
      category: '',
      image: null,
      message: '',
      isLoading: false,
      imagePreview: null,
      imageSizeError: false
    };

    // Bangladesh districts and their cities
    this.bangladeshData = {
      'Dhaka': ['Dhaka City', 'Dhanmondi', 'Gulshan', 'Uttara', 'Mirpur', 'Wari'],
      'Chittagong': ['Chittagong City', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Brahmanbaria'],
      'Sylhet': ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
      'Rajshahi': ['Rajshahi City', 'Rangpur', 'Bogra', 'Pabna', 'Sirajganj'],
      'Khulna': ['Khulna City', 'Jessore', 'Kushtia', 'Satkhira', 'Bagerhat'],
      'Barisal': ['Barisal City', 'Patuakhali', 'Bhola', 'Pirojpur'],
      'Mymensingh': ['Mymensingh City', 'Jamalpur', 'Sherpur', 'Netrokona']
    };
  }

  componentDidMount() {
    // Check if user is logged in and is a renter
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const userType = localStorage.getItem('userType');

    console.log('Component mount - Login status:', {
      isLoggedIn,
      username,
      fullName,
      userType
    });

    if (!isLoggedIn) {
      this.setState({ message: 'Please log in to create a listing.' });
      return;
    }

    if (userType !== 'renter') {
      this.setState({ message: 'Only renters can create listings. Please contact support to change your account type.' });
      return;
    }
  }

  onChangeName(e) {
    this.setState({ name: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onChangePriceHourly(e) {
    this.setState({ 
      pricing: { 
        ...this.state.pricing, 
        hourly: e.target.value 
      } 
    });
  }

  onChangePriceDaily(e) {
    this.setState({ 
      pricing: { 
        ...this.state.pricing, 
        daily: e.target.value 
      } 
    });
  }

  onChangePriceMonthly(e) {
    this.setState({ 
      pricing: { 
        ...this.state.pricing, 
        monthly: e.target.value 
      } 
    });
  }

  onTogglePricingOption(type) {
    this.setState(prevState => ({
      pricingOptions: {
        ...prevState.pricingOptions,
        [type]: !prevState.pricingOptions[type]
      },
      // Clear the price value when hiding the option
      pricing: {
        ...prevState.pricing,
        [type === 'showHourly' ? 'hourly' : type === 'showDaily' ? 'daily' : 'monthly']: 
          !prevState.pricingOptions[type] ? prevState.pricing[type === 'showHourly' ? 'hourly' : type === 'showDaily' ? 'daily' : 'monthly'] : ''
      }
    }));
  }

  onChangeDistrict(e) {
    this.setState({ 
      district: e.target.value,
      city: '' // Reset city when district changes
    });
  }

  onChangeCity(e) {
    this.setState({ city: e.target.value });
  }

  onChangeCategory(e) {
    this.setState({ category: e.target.value });
  }

  onChangeImage(e) {
    const file = e.target.files[0];
    if (file) {
      // Check file size (150KB = 150 * 1024 bytes)
      if (file.size > 150 * 1024) {
        this.setState({
          imageSizeError: true,
          image: null,
          imagePreview: null
        });
        return;
      }

      this.setState({
        image: file,
        imageSizeError: false,
        imagePreview: URL.createObjectURL(file)
      });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    // Check if user is logged in and is a renter
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');

    if (!isLoggedIn) {
      this.setState({ message: 'Please log in to create a listing.' });
      return;
    }

    if (userType !== 'renter') {
      this.setState({ message: 'Only renters can create listings. Please contact support to change your account type.' });
      return;
    }

    // Check if at least one pricing option is provided
    const { hourly, daily, monthly } = this.state.pricing;
    const { showHourly, showDaily, showMonthly } = this.state.pricingOptions;
    
    // Check if at least one pricing option is enabled
    if (!showHourly && !showDaily && !showMonthly) {
      this.setState({ message: 'Please enable at least one pricing option (hourly, daily, or monthly).' });
      return;
    }
    
    // Check if enabled pricing options have values
    const hasValidPricing = (showHourly && hourly) || (showDaily && daily) || (showMonthly && monthly);
    if (!hasValidPricing) {
      this.setState({ message: 'Please provide pricing for at least one enabled pricing option.' });
      return;
    }

    // Additional validation for required fields
    if (!this.state.name.trim()) {
      this.setState({ message: 'Item name is required.' });
      return;
    }
    
    if (!this.state.description.trim()) {
      this.setState({ message: 'Description is required.' });
      return;
    }
    
    if (!this.state.category) {
      this.setState({ message: 'Category is required.' });
      return;
    }
    
    if (!this.state.district) {
      this.setState({ message: 'District is required.' });
      return;
    }
    
    if (!this.state.city) {
      this.setState({ message: 'City is required.' });
      return;
    }

    if (!username) {
      this.setState({ message: 'User not found. Please log in again.' });
      return;
    }

    // Check if image is provided (now mandatory)
    if (!this.state.image) {
      this.setState({ message: 'Image is required for all listings. Please select an image.' });
      return;
    }

    this.setState({ isLoading: true, message: '' });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', this.state.name.trim());
    formData.append('description', this.state.description.trim());
    
    // Add pricing data
    if (showHourly && hourly) formData.append('pricingHourly', hourly);
    if (showDaily && daily) formData.append('pricingDaily', daily);
    if (showMonthly && monthly) formData.append('pricingMonthly', monthly);
    
    formData.append('district', this.state.district);
    formData.append('city', this.state.city);
    formData.append('category', this.state.category);
    formData.append('owner', username);
    formData.append('image', this.state.image); // Image is now mandatory

    console.log('Creating listing...');
    console.log('Form data being sent:');
    console.log('name:', this.state.name.trim());
    console.log('description:', this.state.description.trim());
    console.log('district:', this.state.district);
    console.log('city:', this.state.city);
    console.log('category:', this.state.category);
    console.log('owner:', username);
    console.log('showHourly:', showHourly, 'hourly value:', hourly);
    console.log('showDaily:', showDaily, 'daily value:', daily);
    console.log('showMonthly:', showMonthly, 'monthly value:', monthly);
    console.log('image:', this.state.image?.name);
    
    // Debug: Log all FormData entries
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key + ':', value);
    }

    axios.post('http://localhost:3000/listings/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        console.log('Listing created successfully:', res.data);
        
        // Show success message
        this.setState({
          message: '🎉 Listing created successfully! Redirecting to homepage...',
          isLoading: false,
          name: '',
          description: '',
          pricing: {
            hourly: '',
            daily: '',
            monthly: ''
          },
          pricingOptions: {
            showHourly: false,
            showDaily: false,
            showMonthly: false
          },
          district: '',
          city: '',
          category: '',
          image: null,
          imagePreview: null
        });
        
        // Reset the file input
        document.getElementById('imageInput').value = '';
        
        // Show browser alert for confirmation
        alert('🎉 Success! Your listing has been created successfully and is now live on Rentacube!');
        
        // Redirect to homepage immediately after alert is dismissed
        window.location.replace('/');
      })
      .catch(err => {
        console.error('Error creating listing:', err.response?.data || err.message);
        this.setState({
          message: `Error: ${err.response?.data || err.message}`,
          isLoading: false
        });
      });
  }

  getCitiesForDistrict() {
    if (!this.state.district) return [];
    return this.bangladeshData[this.state.district] || [];
  }

  render() {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg">
              <div className="card-header">
                <h3 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>Create Your Listing
                </h3>
              </div>
              <div className="card-body">
                {this.state.message && (
                  <div className={`alert ${this.state.message.includes('Error') ? 'alert-danger' : 'alert-success'} ${this.state.message.includes('🎉') ? 'alert-success border-success' : ''}`}>
                    <div className="d-flex align-items-center">
                      {this.state.message.includes('🎉') && (
                        <i className="fas fa-check-circle me-2 text-success"></i>
                      )}
                      {this.state.message.includes('Error') && (
                        <i className="fas fa-exclamation-triangle me-2"></i>
                      )}
                      <span>{this.state.message}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={this.onSubmit}>
                  {/* Name */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tag me-2"></i>Item Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={this.state.name}
                      onChange={this.onChangeName}
                      required
                      minLength="3"
                      maxLength="100"
                      placeholder="e.g., Professional Camera, Mountain Bike, Wedding Dress"
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-align-left me-2"></i>Description
                    </label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={this.state.description}
                      onChange={this.onChangeDescription}
                      required
                      minLength="10"
                      maxLength="1000"
                      placeholder="Describe your item in detail - condition, features, usage guidelines, etc."
                    />
                  </div>

                  {/* Pricing */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-dollar-sign me-2"></i>Pricing Options
                    </label>
                    <p className="text-muted small">Select which pricing options you want to offer:</p>
                    
                    {/* Pricing Option Toggles */}
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="hourlyCheck"
                            checked={this.state.pricingOptions.showHourly}
                            onChange={() => this.onTogglePricingOption('showHourly')}
                          />
                          <label className="form-check-label" htmlFor="hourlyCheck">
                            Hourly Rate
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="dailyCheck"
                            checked={this.state.pricingOptions.showDaily}
                            onChange={() => this.onTogglePricingOption('showDaily')}
                          />
                          <label className="form-check-label" htmlFor="dailyCheck">
                            Daily Rate
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="monthlyCheck"
                            checked={this.state.pricingOptions.showMonthly}
                            onChange={() => this.onTogglePricingOption('showMonthly')}
                          />
                          <label className="form-check-label" htmlFor="monthlyCheck">
                            Monthly Rate
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hourly Price */}
                    {this.state.pricingOptions.showHourly && (
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <label className="form-label">Hourly Rate</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input 
                              type="number" 
                              className="form-control"
                              value={this.state.pricing.hourly}
                              onChange={this.onChangePriceHourly}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                            <span className="input-group-text">/hour</span>
                          </div>
                        </div>
                      </div>
                    )}
                      
                    {/* Daily Price */}
                    {this.state.pricingOptions.showDaily && (
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <label className="form-label">Daily Rate</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input 
                              type="number" 
                              className="form-control"
                              value={this.state.pricing.daily}
                              onChange={this.onChangePriceDaily}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                            <span className="input-group-text">/day</span>
                          </div>
                        </div>
                      </div>
                    )}
                      
                    {/* Monthly Price */}
                    {this.state.pricingOptions.showMonthly && (
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <label className="form-label">Monthly Rate</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input 
                              type="number" 
                              className="form-control"
                              value={this.state.pricing.monthly}
                              onChange={this.onChangePriceMonthly}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                            <span className="input-group-text">/month</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tags me-2"></i>Category
                    </label>
                    <select 
                      className="form-select"
                      value={this.state.category}
                      onChange={this.onChangeCategory}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="vehicles">🚗 Vehicles</option>
                      <option value="electronics">📱 Electronics</option>
                      <option value="clothing">👕 Clothing</option>
                      <option value="home">🏠 Home</option>
                      <option value="property">🏢 Property</option>
                      <option value="sports">⚽ Sports</option>
                      <option value="services">🛠️ Services</option>
                    </select>
                  </div>

                  {/* District */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-map-marker-alt me-2"></i>District
                    </label>
                    <select 
                      className="form-select"
                      value={this.state.district}
                      onChange={this.onChangeDistrict}
                      required
                    >
                      <option value="">Select district</option>
                      {Object.keys(this.bangladeshData).map(district => (
                        <option key={district} value={district}>🏛️ {district}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  {this.state.district && (
                    <div className="form-group mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-city me-2"></i>City
                      </label>
                      <select 
                        className="form-select"
                        value={this.state.city}
                        onChange={this.onChangeCity}
                        required
                      >
                        <option value="">Select city in {this.state.district}</option>
                        {this.getCitiesForDistrict().map(city => (
                          <option key={city} value={city}>🏙️ {city}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-image me-2"></i>Image *
                    </label>
                    <input 
                      type="file" 
                      id="imageInput"
                      className={`form-control ${this.state.imageSizeError || !this.state.image ? 'is-invalid' : ''}`}
                      accept="image/*"
                      onChange={this.onChangeImage}
                      required
                    />
                    <div className="form-text">
                      <strong>Required:</strong> Maximum file size: 150KB. Supported formats: JPG, PNG, GIF
                    </div>
                    {this.state.imageSizeError && (
                      <div className="invalid-feedback">
                        File size must be less than 150KB. Please choose a smaller image or compress it. Square images work best.
                      </div>
                    )}
                    {!this.state.image && !this.state.imageSizeError && (
                      <div className="invalid-feedback">
                        Please select an image for your listing.
                      </div>
                    )}
                    {this.state.imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={this.state.imagePreview} 
                          alt="Preview" 
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100"
                    disabled={this.state.isLoading || this.state.imageSizeError || !this.state.image}
                  >
                    {this.state.isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Listing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>Create Listing
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
