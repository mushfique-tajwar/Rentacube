import React, { Component } from 'react';
import TimePicker from './time-picker.component';
import { ListingAPI, BookingAPI, ReviewAPI, UserAPI } from '../services/api';

export default class ListingDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listing: null,
  reviews: [],
  ownerProfile: null,
  // Booking UI state
  bookingType: 'daily',
  // Daily
  startDate: '',
  endDate: '',
  // Hourly
  hourlyDate: '',
  hourlyStartTime: '',
  hourlyEndTime: '',
  // Monthly (YYYY-MM)
  monthlyStart: '',
  monthlyEnd: '',
  // Feature detection
  supportsMonthInput: true,
  // Estimate
  totalEstimate: 0,
      bookingMessage: '',
      loading: true,
  error: ''
    };
  }

  componentDidMount() {
    const id = window.location.pathname.split('/').pop();
    this.loadListing(id);
    this.loadReviews(id);
  }

  async loadListing(id) {
    try {
      const { data } = await ListingAPI.byId(id);
      // pick a default booking type based on available pricing
      let defaultType = 'daily';
      if (data?.pricing) {
        if (data.pricing.daily) defaultType = 'daily';
        else if (data.pricing.hourly) defaultType = 'hourly';
        else if (data.pricing.monthly) defaultType = 'monthly';
      }
      // Detect month input support
      let supportsMonthInput = true;
      try {
        const test = document.createElement('input');
        test.setAttribute('type', 'month');
        supportsMonthInput = (test.type === 'month');
      } catch { supportsMonthInput = false; }
      // Initialize sensible defaults for the selected mode
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = (today.getMonth() + 1).toString().padStart(2, '0');
      const dd = today.getDate().toString().padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const tomorrow = new Date(today.getTime() + 24*60*60*1000);
      const tyyyy = tomorrow.getFullYear();
      const tmm = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
      const tdd = tomorrow.getDate().toString().padStart(2, '0');
      const tomorrowStr = `${tyyyy}-${tmm}-${tdd}`;
      const monthStr = `${yyyy}-${mm}`;
      this.setState({
        listing: data,
        loading: false,
        bookingType: defaultType,
        supportsMonthInput,
        // Prefill defaults depending on type
        startDate: defaultType==='daily' ? todayStr : this.state.startDate,
        endDate: defaultType==='daily' ? tomorrowStr : this.state.endDate,
        hourlyDate: defaultType==='hourly' ? todayStr : this.state.hourlyDate,
        hourlyStartTime: defaultType==='hourly' ? (this.state.hourlyStartTime || '09:00') : this.state.hourlyStartTime,
        hourlyEndTime: defaultType==='hourly' ? (this.state.hourlyEndTime || '17:00') : this.state.hourlyEndTime,
        monthlyStart: defaultType==='monthly' ? (this.state.monthlyStart || monthStr) : this.state.monthlyStart,
        monthlyEnd: defaultType==='monthly' ? (this.state.monthlyEnd || monthStr) : this.state.monthlyEnd,
      }, async () => {
        this.recomputeEstimate();
        try {
          if (data?.owner) {
            const prof = await UserAPI.getProfile(data.owner);
            this.setState({ ownerProfile: prof.data });
          }
        } catch {}
      });
    } catch (e) { this.setState({ error: 'Failed to load listing', loading: false }); }
  }

  setBookingType = (type) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const tomorrow = new Date(today.getTime() + 24*60*60*1000);
    const tyyyy = tomorrow.getFullYear();
    const tmm = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const tdd = tomorrow.getDate().toString().padStart(2, '0');
    const tomorrowStr = `${tyyyy}-${tmm}-${tdd}`;
    const monthStr = `${yyyy}-${mm}`;
    if (type === 'hourly') {
      this.setState({ bookingType: 'hourly', hourlyDate: todayStr, hourlyStartTime: this.state.hourlyStartTime || '09:00', hourlyEndTime: this.state.hourlyEndTime || '17:00' }, this.recomputeEstimate);
    } else if (type === 'daily') {
      this.setState({ bookingType: 'daily', startDate: this.state.startDate || todayStr, endDate: this.state.endDate || tomorrowStr }, this.recomputeEstimate);
    } else if (type === 'monthly') {
      this.setState({ bookingType: 'monthly', monthlyStart: this.state.monthlyStart || monthStr, monthlyEnd: this.state.monthlyEnd || monthStr }, this.recomputeEstimate);
    } else {
      this.setState({ bookingType: type }, this.recomputeEstimate);
    }
  }

  async loadReviews(id) {
    try {
      const { data } = await ReviewAPI.forListing(id);
      this.setState({ reviews: data });
    } catch (e) { /* ignore */ }
  }

  // Combine date and time strings into a Date
  combineDateTime(dateStr, timeStr) {
    // dateStr: YYYY-MM-DD, timeStr: HH:MM
    try {
      const [y, m, d] = dateStr.split('-').map(n=>parseInt(n,10));
      const [hh, mm] = timeStr.split(':').map(n=>parseInt(n,10));
      return new Date(y, (m-1), d, hh||0, mm||0, 0, 0);
    } catch { return null; }
  }

  // Compute estimate based on current state and listing
  recomputeEstimate = () => {
    const { listing, bookingType, startDate, endDate, hourlyDate, hourlyStartTime, hourlyEndTime, monthlyStart, monthlyEnd } = this.state;
    if (!listing) { this.setState({ totalEstimate: 0 }); return; }
    const pricing = listing.pricing || {};
    let total = 0;
    if (bookingType === 'hourly') {
      if (!hourlyDate || !hourlyStartTime || !hourlyEndTime) { total = 0; }
      else {
        const s = this.combineDateTime(hourlyDate, hourlyStartTime);
        const e = this.combineDateTime(hourlyDate, hourlyEndTime);
        if (!s || !e || e <= s) total = 0; else {
          const hours = Math.max(1, Math.ceil((e - s) / (1000*60*60)));
          if (pricing.hourly) total = pricing.hourly * hours;
          else if (pricing.daily) total = pricing.daily * Math.ceil(hours/24);
          else if (pricing.monthly) total = pricing.monthly * Math.ceil(hours/(24*30));
        }
      }
    } else if (bookingType === 'daily') {
      if (!startDate || !endDate) total = 0; else {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (e < s) total = 0; else {
          const days = Math.max(1, Math.ceil((e - s) / (1000*60*60*24)));
          if (pricing.daily) total = pricing.daily * days;
          else if (pricing.hourly) total = pricing.hourly * 24 * days;
          else if (pricing.monthly) total = pricing.monthly * Math.ceil(days/30);
          else if (listing.pricePerDay) total = listing.pricePerDay * days;
        }
      }
    } else if (bookingType === 'monthly') {
      if (!monthlyStart || !monthlyEnd) total = 0; else {
        const [sy, sm] = monthlyStart.split('-').map(n=>parseInt(n,10));
        const [ey, em] = monthlyEnd.split('-').map(n=>parseInt(n,10));
        const months = (ey - sy) * 12 + (em - sm) + 1;
        if (months <= 0) total = 0; else {
          if (pricing.monthly) total = pricing.monthly * months;
          else if (pricing.daily) total = pricing.daily * 30 * months;
          else if (pricing.hourly) total = pricing.hourly * 24 * 30 * months;
        }
      }
    }
    this.setState({ totalEstimate: Number.isFinite(total) ? total : 0 });
  }

  book = async (e) => {
    e.preventDefault();
    const { bookingType, startDate, endDate, listing, hourlyDate, hourlyStartTime, hourlyEndTime, monthlyStart, monthlyEnd } = this.state;
    const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (isAdmin) { this.setState({ bookingMessage: 'Admins cannot place bookings.' }); return; }
    if (!username) { this.setState({ bookingMessage: 'Please sign in first.' }); return; }
    let s = null, eDate = null;
    if (bookingType === 'hourly') {
      if (!hourlyDate || !hourlyStartTime || !hourlyEndTime) { this.setState({ bookingMessage: 'Select date and time range.' }); return; }
      s = this.combineDateTime(hourlyDate, hourlyStartTime);
      eDate = this.combineDateTime(hourlyDate, hourlyEndTime);
      if (!s || !eDate || eDate <= s) { this.setState({ bookingMessage: 'Invalid time range.' }); return; }
    } else if (bookingType === 'daily') {
      if (!startDate || !endDate) { this.setState({ bookingMessage: 'Select start and end dates.' }); return; }
      s = new Date(startDate);
      eDate = new Date(endDate);
      if (eDate < s) { this.setState({ bookingMessage: 'Invalid date range.' }); return; }
    } else if (bookingType === 'monthly') {
      if (!monthlyStart || !monthlyEnd) { this.setState({ bookingMessage: 'Select start and end months.' }); return; }
      const [sy, sm] = monthlyStart.split('-').map(n=>parseInt(n,10));
      const [ey, em] = monthlyEnd.split('-').map(n=>parseInt(n,10));
      const start = new Date(sy, sm-1, 1, 0,0,0,0);
      // last day of end month
      const lastDay = new Date(ey, em, 0).getDate();
      const end = new Date(ey, em-1, lastDay, 23,59,59,999);
      if (end < start) { this.setState({ bookingMessage: 'Invalid month range.' }); return; }
      s = start; eDate = end;
    }
    try {
      const { data } = await BookingAPI.create({ listingId: listing._id, customerUsername: username, bookingType, startDate: s, endDate: eDate });
      this.setState({ bookingMessage: data.message || 'Booking requested!' });
    } catch (e) {
      const msg = e.response?.data || 'Booking failed.';
      this.setState({ bookingMessage: msg });
    }
  }

  // Format description with proper line breaks
  formatDescription = (description) => {
    if (!description) return '';
    return description.split(/\r?\n/).map((line, index) => (
      <span key={index}>
        {line}
        {index < description.split(/\r?\n/).length - 1 && <br />}
      </span>
    ));
  }

  renderImageGallery = (listing) => {
    const images = listing.images && listing.images.length > 0 ? listing.images : (listing.image ? [listing.image] : []);
    
    if (images.length === 0) {
      return (
        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center text-muted">
            <i className="fas fa-image fa-3x mb-2"></i>
            <p className="mb-0">No Image Available</p>
          </div>
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <img 
          src={images[0]} 
          alt={listing.name} 
          className="card-img-top" 
          style={{ objectFit: 'cover', maxHeight: '400px' }}
        />
      );
    }

    // Multiple images - scrollable gallery
    return (
      <div style={{ position: 'relative' }}>
        <div 
          className="d-flex overflow-auto gallery-container" 
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            maxHeight: '400px'
          }}
          id={`gallery-${listing._id}`}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${listing.name} ${index + 1}`}
              className="flex-shrink-0"
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                scrollSnapAlign: 'start'
              }}
            />
          ))}
        </div>
        
        {/* Left Navigation Button */}
        <button
          className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 nav-button-hover"
          style={{ zIndex: 10, opacity: 0.7 }}
          onClick={() => {
            const gallery = document.getElementById(`gallery-${listing._id}`);
            if (gallery) {
              gallery.scrollBy({
                left: -gallery.clientWidth,
                behavior: 'smooth'
              });
            }
          }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {/* Right Navigation Button */}
        <button
          className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 nav-button-hover"
          style={{ zIndex: 10, opacity: 0.7 }}
          onClick={() => {
            const gallery = document.getElementById(`gallery-${listing._id}`);
            if (gallery) {
              gallery.scrollBy({
                left: gallery.clientWidth,
                behavior: 'smooth'
              });
            }
          }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        
        {/* Navigation dots */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
          <div className="d-flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className="btn btn-sm rounded-circle p-0"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.9)'
                }}
                onClick={() => {
                  const gallery = document.getElementById(`gallery-${listing._id}`);
                  if (gallery) {
                    gallery.scrollTo({
                      left: index * gallery.clientWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Image counter */}
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-dark bg-opacity-75">
            <i className="fas fa-images me-1"></i>
            {images.length}
          </span>
        </div>
      </div>
    );
  }

  render() {
  const { listing, reviews, loading, error } = this.state;
    if (loading) return <div className="container mt-4"><p>Loading...</p></div>;
    if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
    if (!listing) return null;

  const username = localStorage.getItem('username');
  const isOwner = username && listing.owner === username;

    return (
      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-md-7">
            <div className="card mb-4">
              {/* Image Gallery */}
              {this.renderImageGallery(listing)}
              <div className="card-body">
                <h3>{listing.name}</h3>
                <p className="text-muted mb-1">{listing.city}, {listing.district}</p>
                <p>{this.formatDescription(listing.description)}</p>
                <div className="mb-2">
                  {listing.pricing?.hourly && <span className="badge bg-primary me-2">${listing.pricing.hourly}/hr</span>}
                  {listing.pricing?.daily && <span className="badge bg-success me-2">${listing.pricing.daily}/day</span>}
                  {listing.pricing?.monthly && <span className="badge bg-info me-2">${listing.pricing.monthly}/mo</span>}
                </div>
                {listing.status === 'booked' && (
                  <div className="mb-2">
                    <span className="badge bg-danger me-2">Already Booked</span>
                    {listing.bookedFrom && listing.bookedUntil && (
                      <small className="text-muted">From {new Date(listing.bookedFrom).toLocaleDateString()} to {new Date(listing.bookedUntil).toLocaleDateString()}</small>
                    )}
                  </div>
                )}
                {listing.status === 'unavailable' && (
                  <div className="mb-2">
                    <span className="badge bg-secondary">Currently Unavailable</span>
                  </div>
                )}
                {typeof listing.avgRating === 'number' && listing.reviewCount > 0 && (
                  <div className="mb-2"><i className="fas fa-star text-warning me-1"></i>{listing.avgRating.toFixed(1)} ({listing.reviewCount} reviews)</div>
                )}
                <div className="text-muted small d-flex gap-3 align-items-center">
                  <span><i className="fas fa-eye me-1"></i>{listing.views} views</span>
                  <span><i className="fas fa-book me-1"></i>{listing.bookingsCount || 0} bookings</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h5 className="mb-0">Reviews</h5></div>
              <div className="card-body">
                {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
        {reviews.map(r => (
                  <div key={r._id} className="mb-3 border-bottom pb-2">
                    <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold"><i className="fas fa-user me-1"></i>{r.customerFullName}</span>
                      <span><i className="fas fa-star text-warning me-1"></i>{r.rating}</span>
                    </div>
                    {r.comment && <p className="mb-1">{r.comment}</p>}
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            {!isOwner ? (
              <div className="card mb-4">
                <div className="card-header"><h5 className="mb-0">Book this Item</h5></div>
                <div className="card-body">
                  {listing.status !== 'available' ? (
                    <div className="alert alert-warning mb-0">
                      {listing.status === 'booked' ? (
                        <>
                          This listing is already booked{listing.bookedFrom && listing.bookedUntil && (
                            <> from {new Date(listing.bookedFrom).toLocaleDateString()} to {new Date(listing.bookedUntil).toLocaleDateString()}</>
                          )}.
                        </>
                      ) : (
                        <>This listing is currently unavailable.</>
                      )}
                    </div>
                  ) : (
                  <form onSubmit={this.book}>
                    {/* Booking type selector */}
                    <div className="mb-3">
                      <label className="form-label">Booking Type</label>
                      <div className="btn-group w-100" role="group">
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='hourly'?'active':''}`} disabled={!listing.pricing?.hourly} onClick={()=>this.setBookingType('hourly')}>Hourly</button>
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='daily'?'active':''}`} disabled={!listing.pricing?.daily && !listing.pricePerDay} onClick={()=>this.setBookingType('daily')}>Daily</button>
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='monthly'?'active':''}`} disabled={!listing.pricing?.monthly} onClick={()=>this.setBookingType('monthly')}>Monthly</button>
                      </div>
                    </div>

                    {/* Hourly inputs */}
                    {this.state.bookingType==='hourly' && (
                      <>
                        <div className="mb-3" onClick={()=>this.hDate && this.hDate.showPicker && this.hDate.showPicker()} style={{cursor:'pointer'}}>
                          <label className="form-label">Date</label>
                          <input ref={el=>this.hDate=el} type="date" className="form-control" value={this.state.hourlyDate} onChange={e=>this.setState({hourlyDate:e.target.value}, this.recomputeEstimate)} />
                        </div>
                        <div className="row g-2">
                          <div className="col-6">
                            <TimePicker label="Start time" showAmPm value={this.state.hourlyStartTime || '09:00'} onChange={(val)=>this.setState({hourlyStartTime: val}, this.recomputeEstimate)} />
                          </div>
                          <div className="col-6">
                            <TimePicker label="End time" showAmPm value={this.state.hourlyEndTime || '17:00'} onChange={(val)=>this.setState({hourlyEndTime: val}, this.recomputeEstimate)} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Daily inputs */}
                    {this.state.bookingType==='daily' && (
                      <>
                        <div className="mb-3" onClick={()=>this.startInput && this.startInput.showPicker && this.startInput.showPicker()} style={{cursor:'pointer'}}>
                          <label className="form-label">Start Date</label>
                          <input ref={el=>this.startInput=el} type="date" className="form-control" value={this.state.startDate} onChange={e=>this.setState({startDate:e.target.value}, this.recomputeEstimate)} />
                        </div>
                        <div className="mb-3" onClick={()=>this.endInput && this.endInput.showPicker && this.endInput.showPicker()} style={{cursor:'pointer'}}>
                          <label className="form-label">End Date</label>
                          <input ref={el=>this.endInput=el} type="date" className="form-control" value={this.state.endDate} onChange={e=>this.setState({endDate:e.target.value}, this.recomputeEstimate)} />
                        </div>
                      </>
                    )}

                    {/* Monthly inputs */}
                    {this.state.bookingType==='monthly' && (
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label">Start month</label>
                          {this.state.supportsMonthInput ? (
                            <input ref={el=>this.mStart=el} type="month" className="form-control" value={this.state.monthlyStart} onClick={()=>this.mStart && this.mStart.showPicker && this.mStart.showPicker()} onChange={e=>this.setState({monthlyStart:e.target.value}, this.recomputeEstimate)} />
                          ) : (
                            <div className="d-flex gap-1">
                              <select className="form-select" value={(this.state.monthlyStart||'').split('-')[1]||''} onChange={(e)=>{
                                const parts = (this.state.monthlyStart || `${new Date().getFullYear()}-01`).split('-');
                                const val = `${parts[0]}-${e.target.value.padStart(2,'0')}`;
                                this.setState({ monthlyStart: val }, this.recomputeEstimate);
                              }}>
                                {Array.from({length:12}, (_,i)=> (i+1).toString().padStart(2,'0')).map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <input className="form-control" type="number" min="1970" max="2100" value={(this.state.monthlyStart||'').split('-')[0]||''} onChange={(e)=>{
                                const y = e.target.value || `${new Date().getFullYear()}`;
                                const parts = (this.state.monthlyStart || `${new Date().getFullYear()}-01`).split('-');
                                const val = `${y}-${(parts[1]||'01').padStart(2,'0')}`;
                                this.setState({ monthlyStart: val }, this.recomputeEstimate);
                              }} />
                            </div>
                          )}
                        </div>
                        <div className="col-6">
                          <label className="form-label">End month</label>
                          {this.state.supportsMonthInput ? (
                            <input ref={el=>this.mEnd=el} type="month" className="form-control" value={this.state.monthlyEnd} onClick={()=>this.mEnd && this.mEnd.showPicker && this.mEnd.showPicker()} onChange={e=>this.setState({monthlyEnd:e.target.value}, this.recomputeEstimate)} />
                          ) : (
                            <div className="d-flex gap-1">
                              <select className="form-select" value={(this.state.monthlyEnd||'').split('-')[1]||''} onChange={(e)=>{
                                const parts = (this.state.monthlyEnd || `${new Date().getFullYear()}-01`).split('-');
                                const val = `${parts[0]}-${e.target.value.padStart(2,'0')}`;
                                this.setState({ monthlyEnd: val }, this.recomputeEstimate);
                              }}>
                                {Array.from({length:12}, (_,i)=> (i+1).toString().padStart(2,'0')).map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <input className="form-control" type="number" min="1970" max="2100" value={(this.state.monthlyEnd||'').split('-')[0]||''} onChange={(e)=>{
                                const y = e.target.value || `${new Date().getFullYear()}`;
                                const parts = (this.state.monthlyEnd || `${new Date().getFullYear()}-01`).split('-');
                                const val = `${y}-${(parts[1]||'01').padStart(2,'0')}`;
                                this.setState({ monthlyEnd: val }, this.recomputeEstimate);
                              }} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Total estimate */}
                    <div className="alert alert-secondary mt-3" role="alert">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">Total cost</span>
                        <span className="fs-5">${(this.state.totalEstimate || 0).toFixed(2)}</span>
                      </div>
                      <small className="text-muted">Final total may vary slightly and is confirmed on submit.</small>
                    </div>

                    <button className="btn btn-primary w-100" type="submit">Request Booking</button>
                  </form>
                  )}
                  {this.state.bookingMessage && <div className="alert alert-info mt-3 py-2 mb-0">{this.state.bookingMessage}</div>}
                </div>
              </div>
            ) : (
              <div className="card mb-4">
                <div className="card-header"><h5 className="mb-0">Manage Listing</h5></div>
                <div className="card-body">
                  {!this.state.editMode ? (
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary" onClick={()=>this.setState({ editMode:true, editName: listing.name, editDescription: listing.description, editHourly: listing.pricing?.hourly || '', editDaily: listing.pricing?.daily || '', editMonthly: listing.pricing?.monthly || '', editImages: [], editStatus: listing.status || 'available' })}>Edit Listing</button>
                      <button className="btn btn-outline-danger" onClick={async ()=>{
                        if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone and will also delete all associated images.')) {
                          try {
                            await ListingAPI.softDelete(listing._id, username);
                            window.location.replace('/');
                          } catch(e) { this.setState({ bookingMessage: e.response?.data || 'Failed to delete listing' }); }
                        }
                      }}>Delete Listing</button>
                    </div>
                  ) : (
                    <form onSubmit={async (e)=>{
                      e.preventDefault();
                      try {
                        if (this.state.editImages && this.state.editImages.length > 0) {
                          const form = new FormData();
                          form.append('owner', username);
                          form.append('name', this.state.editName||'');
                          form.append('description', this.state.editDescription||'');
                          if (this.state.editHourly !== '') form.append('pricingHourly', this.state.editHourly);
                          if (this.state.editDaily !== '') form.append('pricingDaily', this.state.editDaily);
                          if (this.state.editMonthly !== '') form.append('pricingMonthly', this.state.editMonthly);
                          if (this.state.editStatus) form.append('status', this.state.editStatus);
                          // Append all selected images
                          this.state.editImages.forEach((image) => {
                            form.append('images', image);
                          });
                          await ListingAPI.update(listing._id, form);
                        } else {
                          const payload = { owner: username, name: this.state.editName||'', description: this.state.editDescription||'' };
                          if (this.state.editHourly !== '') payload.pricingHourly = this.state.editHourly;
                          if (this.state.editDaily !== '') payload.pricingDaily = this.state.editDaily;
                          if (this.state.editMonthly !== '') payload.pricingMonthly = this.state.editMonthly;
                          if (this.state.editStatus) payload.status = this.state.editStatus;
                          await ListingAPI.update(listing._id, payload);
                        }
                        await this.loadListing(listing._id);
                        this.setState({ editMode:false, bookingMessage: 'Listing updated successfully.' });
                      } catch(err) { this.setState({ bookingMessage: err.response?.data || 'Failed to update listing' }); }
                    }}>
                      <div className="mb-2">
                        <label className="form-label">Title</label>
                        <input className="form-control" value={this.state.editName||''} onChange={(e)=>this.setState({editName:e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="3" value={this.state.editDescription||''} onChange={(e)=>this.setState({editDescription:e.target.value})} />
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-4">
                          <label className="form-label">Hourly</label>
                          <input className="form-control" value={this.state.editHourly||''} onChange={(e)=>this.setState({editHourly:e.target.value})} />
                        </div>
                        <div className="col-4">
                          <label className="form-label">Daily</label>
                          <input className="form-control" value={this.state.editDaily||''} onChange={(e)=>this.setState({editDaily:e.target.value})} />
                        </div>
                        <div className="col-4">
                          <label className="form-label">Monthly</label>
                          <input className="form-control" value={this.state.editMonthly||''} onChange={(e)=>this.setState({editMonthly:e.target.value})} />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={this.state.editStatus||'available'} onChange={(e)=>this.setState({editStatus:e.target.value})}>
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Replace Images (Max 3)</label>
                        <input type="file" accept="image/*" multiple className="form-control" onChange={(e)=>{
                          const files = Array.from(e.target.files) || [];
                          const validFiles = [];
                          
                          files.forEach(file => {
                            if (file.size > 200 * 1024) {
                              alert(`Image "${file.name}" exceeds 200KB limit. Please choose a smaller image.`);
                            } else {
                              validFiles.push(file);
                            }
                          });
                          
                          this.setState({editImages: validFiles});
                        }} />
                        <div className="form-text">
                          Select 1-3 images. Maximum file size per image: 200KB.
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-primary" type="submit">Save</button>
                        <button className="btn btn-secondary" type="button" onClick={()=>this.setState({ editMode:false })}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            <div className="card">
              <div className="card-header"><h6 className="mb-0">Owner</h6></div>
              <div className="card-body">
                <p className="mb-1"><strong>{listing.owner}</strong></p>
                {this.state.ownerProfile?.phone ? (
                  <p className="mb-1"><i className="fas fa-phone me-2"></i>{this.state.ownerProfile.phone}</p>
                ) : (
                  <p className="mb-1 text-muted">Phone not provided</p>
                )}
                {this.state.ownerProfile?.createdAt && (
                  <small className="text-muted">Member since {new Date(this.state.ownerProfile.createdAt).toLocaleDateString()}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
