import React, { Component } from 'react';
import { ListingAPI, BookingAPI, ReviewAPI } from '../services/api';

export default class ListingDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listing: null,
      reviews: [],
      startDate: '',
      endDate: '',
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
      this.setState({ listing: data, loading: false });
    } catch (e) { this.setState({ error: 'Failed to load listing', loading: false }); }
  }

  async loadReviews(id) {
    try {
      const { data } = await ReviewAPI.forListing(id);
      this.setState({ reviews: data });
    } catch (e) { /* ignore */ }
  }

  book = async (e) => {
    e.preventDefault();
    const { startDate, endDate, listing } = this.state;
    const username = localStorage.getItem('username');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (isAdmin) { this.setState({ bookingMessage: 'Admins cannot place bookings.' }); return; }
    if (!username) { this.setState({ bookingMessage: 'Please sign in first.' }); return; }
    if (!startDate || !endDate) { this.setState({ bookingMessage: 'Select start and end dates.' }); return; }
    try {
      const { data } = await BookingAPI.create({ listingId: listing._id, customerUsername: username, startDate, endDate });
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
                  <form onSubmit={this.book}>
                    <div className="mb-3" onClick={()=>this.startInput && this.startInput.showPicker && this.startInput.showPicker()} style={{cursor:'pointer'}}>
                      <label className="form-label">Start Date</label>
                      <input ref={el=>this.startInput=el} type="date" className="form-control" value={this.state.startDate} onChange={e=>this.setState({startDate:e.target.value})} />
                    </div>
                    <div className="mb-3" onClick={()=>this.endInput && this.endInput.showPicker && this.endInput.showPicker()} style={{cursor:'pointer'}}>
                      <label className="form-label">End Date</label>
                      <input ref={el=>this.endInput=el} type="date" className="form-control" value={this.state.endDate} onChange={e=>this.setState({endDate:e.target.value})} />
                    </div>
                    <button className="btn btn-primary w-100" type="submit">Request Booking</button>
                  </form>
                  {this.state.bookingMessage && <div className="alert alert-info mt-3 py-2 mb-0">{this.state.bookingMessage}</div>}
                </div>
              </div>
            ) : (
              <div className="card mb-4">
                <div className="card-header"><h5 className="mb-0">Manage Listing</h5></div>
                <div className="card-body">
                  {!this.state.editMode ? (
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary" onClick={()=>this.setState({ editMode:true, editName: listing.name, editDescription: listing.description, editHourly: listing.pricing?.hourly || '', editDaily: listing.pricing?.daily || '', editMonthly: listing.pricing?.monthly || '', editImage: null })}>Edit Listing</button>
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
                          form.append('image', this.state.editImage);
                          await ListingAPI.update(listing._id, form);
                        } else {
                          const payload = { owner: username, name: this.state.editName||'', description: this.state.editDescription||'' };
                          if (this.state.editHourly !== '') payload.pricingHourly = this.state.editHourly;
                          if (this.state.editDaily !== '') payload.pricingDaily = this.state.editDaily;
                          if (this.state.editMonthly !== '') payload.pricingMonthly = this.state.editMonthly;
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
