import React, { Component } from 'react';
import TimePicker from './time-picker.component';
import { ListingAPI, BookingAPI, ReviewAPI } from '../services/api';

export default class ListingDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listing: null,
      reviews: [],
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
      this.setState({ listing: data, loading: false, bookingType: defaultType }, () => this.recomputeEstimate());
    } catch (e) { this.setState({ error: 'Failed to load listing', loading: false }); }
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
              {listing.image && <img src={`/images/listings/${listing.image}`} alt={listing.name} className="card-img-top" style={{objectFit:'cover', maxHeight:'400px'}}/>}
              <div className="card-body">
                <h3>{listing.name}</h3>
                <p className="text-muted mb-1">{listing.city}, {listing.district}</p>
                <p>{listing.description}</p>
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
                <div className="text-muted small"><i className="fas fa-eye me-1"></i>{listing.views} views</div>
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
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='hourly'?'active':''}`} disabled={!listing.pricing?.hourly} onClick={()=>this.setState({bookingType:'hourly'}, this.recomputeEstimate)}>Hourly</button>
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='daily'?'active':''}`} disabled={!listing.pricing?.daily && !listing.pricePerDay} onClick={()=>this.setState({bookingType:'daily'}, this.recomputeEstimate)}>Daily</button>
                        <button type="button" className={`btn btn-outline-secondary ${this.state.bookingType==='monthly'?'active':''}`} disabled={!listing.pricing?.monthly} onClick={()=>this.setState({bookingType:'monthly'}, this.recomputeEstimate)}>Monthly</button>
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
                          <input type="month" className="form-control" value={this.state.monthlyStart} onChange={e=>this.setState({monthlyStart:e.target.value}, this.recomputeEstimate)} />
                        </div>
                        <div className="col-6">
                          <label className="form-label">End month</label>
                          <input type="month" className="form-control" value={this.state.monthlyEnd} onChange={e=>this.setState({monthlyEnd:e.target.value}, this.recomputeEstimate)} />
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
                      <button className="btn btn-outline-primary" onClick={()=>this.setState({ editMode:true, editName: listing.name, editDescription: listing.description, editHourly: listing.pricing?.hourly || '', editDaily: listing.pricing?.daily || '', editMonthly: listing.pricing?.monthly || '', editImage: null, editStatus: listing.status || 'available' })}>Edit Listing</button>
                      <button className="btn btn-outline-danger" onClick={async ()=>{
                        try {
                          await ListingAPI.softDelete(listing._id, username);
                          window.location.replace('/');
                        } catch(e) { this.setState({ bookingMessage: e.response?.data || 'Failed to delete listing' }); }
                      }}>Delete Listing</button>
                    </div>
                  ) : (
                    <form onSubmit={async (e)=>{
                      e.preventDefault();
                      try {
                        if (this.state.editImage) {
                          const form = new FormData();
                          form.append('owner', username);
                          form.append('name', this.state.editName||'');
                          form.append('description', this.state.editDescription||'');
                          if (this.state.editHourly !== '') form.append('pricingHourly', this.state.editHourly);
                          if (this.state.editDaily !== '') form.append('pricingDaily', this.state.editDaily);
                          if (this.state.editMonthly !== '') form.append('pricingMonthly', this.state.editMonthly);
                          if (this.state.editStatus) form.append('status', this.state.editStatus);
                          form.append('image', this.state.editImage);
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
                        <label className="form-label">Replace Image</label>
                        <input type="file" accept="image/*" className="form-control" onChange={(e)=>this.setState({editImage:e.target.files?.[0]||null})} />
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
                <p className="mb-0"><strong>{listing.owner}</strong></p>
                <small className="text-muted">Contact feature coming soon.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
