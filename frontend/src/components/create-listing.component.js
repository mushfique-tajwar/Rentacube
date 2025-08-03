import React, { Component } from 'react';
import axios from 'axios';

export default class CreateListing extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangePricePerDay = this.onChangePricePerDay.bind(this);
    this.onChangeDistrict = this.onChangeDistrict.bind(this);
    this.onChangeCity = this.onChangeCity.bind(this);
    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onChangeImage = this.onChangeImage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: '',
      description: '',
      pricePerDay: '',
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

  onChangeName(e) {
    this.setState({ name: e.target.value });
  }

  onChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  onChangePricePerDay(e) {
    this.setState({ pricePerDay: e.target.value });
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

    // Check if user is logged in and is a lister
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');

    if (!isLoggedIn) {
      this.setState({ message: 'Please log in to create a listing.' });
      return;
    }

    if (userType !== 'lister') {
      this.setState({ message: 'Only listers can create listings. Please contact support to change your account type.' });
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
    formData.append('name', this.state.name);
    formData.append('description', this.state.description);
    formData.append('pricePerDay', this.state.pricePerDay);
    formData.append('district', this.state.district);
    formData.append('city', this.state.city);
    formData.append('category', this.state.category);
    formData.append('owner', username);
    formData.append('image', this.state.image); // Image is now mandatory

    console.log('Creating listing...');

    axios.post('http://localhost:3000/listings/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        console.log('Listing created successfully:', res.data);
        this.setState({
          message: 'Listing created successfully!',
          isLoading: false,
          name: '',
          description: '',
          pricePerDay: '',
          district: '',
          city: '',
          category: '',
          image: null,
          imagePreview: null
        });
        
        // Reset the file input
        document.getElementById('imageInput').value = '';
        
        // Redirect to homepage after successful creation
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>Create Your Listing
                </h3>
              </div>
              <div className="card-body">
                {this.state.message && (
                  <div className={`alert ${this.state.message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                    {this.state.message}
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

                  {/* Price */}
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-dollar-sign me-2"></i>Price per Day
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input 
                        type="number" 
                        className="form-control"
                        value={this.state.pricePerDay}
                        onChange={this.onChangePricePerDay}
                        required
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
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
                        File size must be less than 150KB. Please choose a smaller image or compress it.
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
