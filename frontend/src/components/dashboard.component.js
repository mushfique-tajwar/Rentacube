import React, { Component } from 'react';
import { BookingAPI, ReviewAPI, UserAPI } from '../services/api';
import { ListingAPI } from '../services/api';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
  user: { username: '', fullName: '', email: '', phone: '', location: '', createdAt: '' },
      listings: [], // TODO: fetch user's listings
      bookings: [],
      reviewsGiven: {}, // bookingId -> true
      analytics: { totalViews: 0, totalEarnings: 0, activeListings: 0, completedBookings: 0 },
      activeTab: 'profile',
      isLoading: true,
      message: ''
    };
  }

  componentDidMount() {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!username || !isLoggedIn) {
      // Redirect to sign in if not logged in
      window.location.href = '/signin';
      return;
    }
    this.username = username;
  this.userType = (localStorage.getItem('userType') || '').toLowerCase();
  this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (this.isAdmin) {
      // Admins are not allowed on user dashboard
      window.location.href = '/admin';
      return;
    }
    this.loadUserData(username);
    if ((localStorage.getItem('userType') || '').toLowerCase() === 'renter') {
      this.loadListings(username);
    }
    this.loadBookings(username);
  // Kick off an auto-complete on load (no-op if none due)
  BookingAPI.autoComplete().catch(()=>{});
  }

  loadUserData = async (username) => {
    // Seed from localStorage for instant paint
    this.setState({ user: { 
      username,
      fullName: localStorage.getItem('fullName') || username,
      email: localStorage.getItem('email') || `${username}@example.com`,
      phone: localStorage.getItem('phone') || '',
      location: localStorage.getItem('location') || '' ,
      createdAt: localStorage.getItem('createdAt') ? new Date(localStorage.getItem('createdAt')).toLocaleDateString() : ''
    } });
    // Fetch authoritative profile from server (fills phone/createdAt reliably)
    try {
      const { data } = await UserAPI.getProfile(username);
      const updated = {
        username: data.username || username,
        fullName: data.fullName || localStorage.getItem('fullName') || username,
        email: data.email || localStorage.getItem('email') || `${username}@example.com`,
        phone: data.phone || '',
        location: data.location || '',
        createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ''
      };
      // Persist to localStorage for other components
      localStorage.setItem('fullName', updated.fullName || '');
      if (updated.email) localStorage.setItem('email', updated.email);
      localStorage.setItem('phone', updated.phone || '');
      localStorage.setItem('location', updated.location || '');
      if (data.createdAt) localStorage.setItem('createdAt', data.createdAt);
      this.setState({ user: updated });
    } catch { /* ignore, keep local values */ }
  }

  loadListings = async (owner) => {
    try {
      const { data } = await ListingAPI.byOwner(owner);
      const listings = data.map(l => ({
        id: l._id,
        title: l.name,
        pricing: l.pricing || {},
  status: l.isActive ? 'Active' : 'Inactive',
  availability: l.status || 'available',
        views: l.views || 0,
        bookingsCount: l.bookingsCount || 0
      }));
      this.setState({ listings }, this.updateAnalyticsFromState);
    } catch (e) {
      // Non-fatal
    }
  }

  // Helper copied from homepage: compute daily-equivalent price
  getComparablePrice = (listing) => {
    const p = listing.pricing || {};
    if (p.daily) return p.daily;
    if (p.hourly) return p.hourly * 24;
    if (p.monthly) return Math.round(p.monthly / 30);
    return listing.pricePerDay || 0;
  }

  loadBookings = async (username) => {
    try {
      const { data } = await BookingAPI.forUser(username);
      const bookings = data.map(b => ({
        id: b._id,
        listingId: b.listing?._id || b.listing,
        property: b.listing?.name || 'Listing',
        renterUsername: b.renterUsername,
        customerUsername: b.customerUsername,
        dates: `${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`,
        status: b.status,
        amount: `$${b.totalPrice}`,
  paymentStatus: b.paymentStatus || 'Unpaid',
        canReview: b.status === 'Completed' && b.customerUsername === username
      }));
      this.setState({ bookings, isLoading: false }, this.updateAnalyticsFromState);
    } catch (e) {
      console.error(e);
      this.setState({ isLoading: false, message: 'Failed to load bookings' });
    }
  }

  updateAnalyticsFromState = () => {
    const totalViews = (this.state.listings || []).reduce((sum, l) => sum + (l.views || 0), 0);
    const completedBookings = (this.state.bookings || []).filter(b => b.status === 'Completed').length;
    // Estimate total earnings: sum of totalPrice for Completed where renterUsername === current user
    const totalEarnings = (this.state.bookings || []).reduce((sum, b) => {
      if (b.status === 'Completed' && b.renterUsername === this.username) {
        const n = Number((b.amount || '').replace(/[^0-9.]/g, '')) || 0;
        return sum + n;
      }
      return sum;
    }, 0);
    const activeListings = (this.state.listings || []).filter(l => l.status === 'Active').length;
    this.setState({ analytics: { totalViews, totalEarnings, activeListings, completedBookings } });
  }

  updateBookingStatus = async (bookingId, status) => {
    try {
      await BookingAPI.updateStatus(bookingId, status);
      this.loadBookings(this.username);
      this.setState({ message: 'Booking status updated.' });
    } catch (e) {
      const msg = e?.response?.data || e?.message || 'Failed to update status';
      this.setState({ message: msg });
    }
  }

  submitReview = async (bookingId, listingId) => {
    this.setState({ showReviewForm: bookingId, reviewRating: '', reviewComment: '', message: '' });
  }

  handleReviewSubmit = async (bookingId, listingId) => {
    const rating = Number(this.state.reviewRating);
    if (!rating || rating < 1 || rating > 5) {
      this.setState({ message: 'Invalid rating (1-5)' });
      return;
    }
    const comment = this.state.reviewComment || '';
    try {
      await ReviewAPI.create({ bookingId, listingId, rating, comment, customerUsername: this.username });
      this.setState(prev => ({ reviewsGiven: { ...prev.reviewsGiven, [bookingId]: true }, showReviewForm: null, reviewRating: '', reviewComment: '', message: 'Review submitted.' }));
    } catch (e) {
      const msg = e?.response?.data || e?.message || 'Failed to submit review';
      this.setState({ message: msg });
    }
  }

  setActiveTab = (tab) => {
  if (tab === 'analytics' && this.userType !== 'renter') return; // prevent customers from accessing analytics
  this.setState({ activeTab: tab });
  }

  handleSaveProfile = async () => {
    try {
      const { username, fullName, phone, location } = this.state.user;
      await UserAPI.updateProfile({ username, fullName, phone, location });
      localStorage.setItem('fullName', fullName || '');
      localStorage.setItem('phone', phone || '');
      localStorage.setItem('location', location || '');
  this.setState({ message: 'Profile updated' });
  } catch (e) { this.setState({ message: 'Failed to update profile' }); }
  }

  handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = this.state;
    if (!oldPassword || !newPassword) return this.setState({ message: 'Please fill all password fields' });
    if (newPassword !== confirmPassword) return this.setState({ message: 'New passwords do not match' });
    try {
      await UserAPI.changePassword({ username: this.username, oldPassword, newPassword });
      this.setState({ oldPassword: '', newPassword: '', confirmPassword: '' });
      this.setState({ message: 'Password changed' });
  } catch (e) { this.setState({ message: e.response?.data || 'Failed to change password' }); }
  }

  handleRequestRenter = async () => {
  // Allow re-applying even if previously rejected; backend will set status to pending
    if (!this.state.user.phone) {
      this.setState({ message: 'Please add a phone number to your profile before applying to become a renter.' });
      return;
    }
    try {
  const { username, phone } = this.state.user;
  const { data } = await UserAPI.requestRenter({ username, phone });
      localStorage.setItem('userType', data.userType);
      localStorage.setItem('approvalStatus', data.approvalStatus);
  this.userType = (data.userType || '').toLowerCase();
      this.setState({ message: data.message + ' Your account is now pending approval.' });
    } catch (e) {
      this.setState({ message: e.response?.data || 'Failed to submit renter request' });
    }
  }

  renderProfile = () => (
    <div className="card shadow">
      <div className="card-header">
        <h5>User Profile</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-12">
            <p><strong>Username:</strong> {this.state.user.username}</p>
            <p><strong>Full Name:</strong> {this.state.user.fullName}</p>
            <p><strong>Email:</strong> {this.state.user.email}</p>
            <p><strong>Phone:</strong> {this.state.user.phone || <span className="text-muted">Not set</span>}</p>
            <p><strong>Location:</strong> {this.state.user.location || <span className="text-muted">Not set</span>}</p>
            <p><strong>Member Since:</strong> {this.state.user.createdAt}</p>
          </div>
        </div>
      </div>
    </div>
  )

  renderListingsAndBookings = () => {
    const isRenter = this.userType === 'renter';
    const customersList = (this.state.bookings || []).filter(b =>
      isRenter ? b.renterUsername === this.username : b.customerUsername === this.username
    );
    const myOwnBookings = isRenter ? (this.state.bookings || []).filter(b => b.customerUsername === this.username) : [];

    return (
      <>
        <div className="row">
          {isRenter && (
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-header"><h5>My Listings</h5></div>
                <div className="card-body">
                  {this.state.listings.length === 0 ? (
                    <p className="text-muted">No listings yet</p>
                  ) : (
                    this.state.listings.map(l => (
                      <div key={l.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <div style={{maxWidth:'70%'}}>
                            {this.state.editListingId === l.id ? (
                              <>
                                <input className="form-control form-control-sm mb-1" value={this.state.editTitle||''} onChange={(e)=>this.setState({editTitle:e.target.value})} />
                                <div className="row g-1">
                                  <div className="col-4"><input className="form-control form-control-sm" placeholder="Hourly" value={this.state.editHourly||''} onChange={(e)=>this.setState({editHourly:e.target.value})} /></div>
                                  <div className="col-4"><input className="form-control form-control-sm" placeholder="Daily" value={this.state.editDaily||''} onChange={(e)=>this.setState({editDaily:e.target.value})} /></div>
                                  <div className="col-4"><input className="form-control form-control-sm" placeholder="Monthly" value={this.state.editMonthly||''} onChange={(e)=>this.setState({editMonthly:e.target.value})} /></div>
                                </div>
                                <div className="mt-2">
                                  <label className="form-label mb-1 small">Status</label>
                                  <select className="form-select form-select-sm" value={this.state.editStatus||'available'} onChange={(e)=>this.setState({editStatus:e.target.value})}>
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                  </select>
                                </div>
                              </>
                            ) : (
                              <>
                                <h6 className="mb-1" role="button" style={{cursor:'pointer'}} onClick={() => window.location.href = `/listing/${l.id}` }>{l.title}</h6>
                                <div className="mb-1">
                                  {l.pricing?.hourly ? <span className="badge bg-primary me-1">${l.pricing.hourly}/hr</span> : null}
                                  {l.pricing?.daily ? <span className="badge bg-success me-1">${l.pricing.daily}/day</span> : null}
                                  {l.pricing?.monthly ? <span className="badge bg-info me-1">${l.pricing.monthly}/mo</span> : null}
                                  {!l.pricing?.hourly && !l.pricing?.daily && !l.pricing?.monthly && (
                                    <span className="text-muted">Price on request</span>
                                  )}
                                  <span className={`badge ms-2 ${l.availability==='available'?'bg-success':l.availability==='booked'?'bg-danger':'bg-secondary'}`}>{l.availability}</span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-end">
                            <span className={`badge ${l.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{l.status}</span>
                            <p className="mb-0 small text-muted">{l.views} views • {l.bookingsCount || 0} bookings</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-1">
                          {this.state.editListingId === l.id ? (
                            <>
                              <button className="btn btn-success btn-sm" onClick={async ()=>{
                                try {
                                  const payload = { owner: this.username, name: this.state.editTitle };
                                  if (this.state.editHourly !== '') payload.pricingHourly = this.state.editHourly;
                                  if (this.state.editDaily !== '') payload.pricingDaily = this.state.editDaily;
                                  if (this.state.editMonthly !== '') payload.pricingMonthly = this.state.editMonthly;
                                  if (this.state.editStatus) payload.status = this.state.editStatus;
                                  await ListingAPI.update(l.id, payload);
                                  this.setState({ editListingId:null, editTitle:'', editHourly:'', editDaily:'', editMonthly:'' });
                                  this.loadListings(this.username);
                                  this.setState({ message: 'Listing updated.' });
                                } catch (e) { this.setState({ message: 'Failed to update listing' }); }
                              }}>Save</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>this.setState({ editListingId:null })}>Cancel</button>
                            </>
                          ) : (
                            <button className="btn btn-outline-primary btn-sm" onClick={()=>this.setState({ 
                              editListingId: l.id,
                              editTitle: l.title,
                              editHourly: l.pricing?.hourly ?? '',
                              editDaily: l.pricing?.daily ?? '',
                              editMonthly: l.pricing?.monthly ?? '',
                              editStatus: l.availability || 'available'
                            })}>Edit</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <button className="btn btn-primary btn-sm mt-2" onClick={()=>window.location.href='/create-listing'}>Add New Listing</button>
                </div>
              </div>
            </div>
          )}

          <div className={isRenter ? 'col-md-6' : 'col-12'}>
            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{isRenter ? 'Customers' : 'My Bookings'}</h5>
                {isRenter && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={async ()=>{ try { await BookingAPI.autoComplete(); this.loadBookings(this.username); this.setState({ message: 'Checked and auto-completed due bookings.' }); } catch(e){} }}>Auto-complete due</button>
                )}
              </div>
              <div className="card-body">
                {this.state.message && <div className="alert alert-info py-2">{this.state.message}</div>}
                {customersList.length === 0 ? (
                  <p className="text-muted">{isRenter ? 'No customers yet' : 'No bookings yet'}</p>
                ) : (
                  customersList.map(b => (
                    <div key={b.id} className="border-bottom pb-2 mb-2">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6>{b.property}</h6>
                          <p className="mb-1 text-muted">{b.dates}</p>
                          <p className="mb-1 small text-muted">Renter: {b.renterUsername} | Customer: {b.customerUsername}</p>
                        </div>
                        <div className="text-end" style={{minWidth:'140px'}}>
                          <span className={`badge mb-1 ${b.status === 'Pending' ? 'bg-secondary' : b.status === 'Confirmed' ? 'bg-warning' : b.status === 'Completed' ? 'bg-success' : 'bg-danger'}`}>{b.status}</span>
                          <p className="mb-1 small text-muted">{b.amount}</p>
                          {b.paymentStatus && (
                            <div className="mb-1"><span className={`badge ${b.paymentStatus==='Unpaid'?'bg-secondary':b.paymentStatus==='Paid'?'bg-info':'bg-success'}`}>{b.paymentStatus}</span></div>
                          )}
                          {!this.isAdmin && b.renterUsername === this.username && b.status === 'Pending' && (
                            <div className="btn-group btn-group-sm mb-1">
                              <button className="btn btn-outline-success" onClick={()=>this.updateBookingStatus(b.id,'Confirmed')}>Confirm</button>
                              <button className="btn btn-outline-danger" onClick={()=>this.updateBookingStatus(b.id,'Cancelled')}>Cancel</button>
                            </div>
                          )}
                          {!this.isAdmin && b.renterUsername === this.username && b.status === 'Confirmed' && (
                            <div className="btn-group btn-group-sm mb-1">
                              <button className="btn btn-outline-primary" onClick={()=>this.updateBookingStatus(b.id,'Completed')}>Complete</button>
                              <button className="btn btn-outline-danger" onClick={()=>this.updateBookingStatus(b.id,'Cancelled')}>Cancel</button>
                            </div>
                          )}
                          {!this.isAdmin && b.renterUsername === this.username && b.paymentStatus === 'Unpaid' && b.status !== 'Cancelled' && (
                            <div className="mb-1">
                              <button className="btn btn-sm btn-outline-success" onClick={()=>this.setState({ showPayFor: b.id, payMethod: 'cash', payRef: '' })}>Mark Paid (renter)</button>
                            </div>
                          )}
                          {!this.isAdmin && b.customerUsername === this.username && b.status !== 'Cancelled' && b.paymentStatus === 'Unpaid' && (
                            <div className="mb-1">
                              <button className="btn btn-sm btn-outline-success" onClick={()=>this.setState({ showPayFor: b.id, payMethod: 'bkash', payRef: '' })}>Pay</button>
                            </div>
                          )}
                          {this.state.showPayFor === b.id && (
                            <div className="border rounded p-2 mt-2">
                              <div className="mb-2">
                                <label className="form-label mb-1">Payment Method</label>
                                <select className="form-select form-select-sm" value={this.state.payMethod||'bkash'} onChange={e=>this.setState({payMethod:e.target.value})}>
                                  <option value="bkash">bKash</option>
                                  <option value="nagad">Nagad</option>
                                  <option value="card">Card</option>
                                  <option value="cash">Cash</option>
                                </select>
                              </div>
                              <div className="mb-2">
                                <label className="form-label mb-1">Reference / Txn ID</label>
                                <input className="form-control form-control-sm" value={this.state.payRef||''} onChange={e=>this.setState({payRef:e.target.value})} placeholder="e.g., TX123..." />
                              </div>
                              <div className="d-flex gap-2">
                                <button className="btn btn-success btn-sm" onClick={async ()=>{
                                  if ((this.state.payMethod || 'bkash') !== 'cash' && !this.state.payRef) {
                                    this.setState({ message: 'Please provide a payment reference/transaction ID.' });
                                    return;
                                  }
                                  try {
                                    await BookingAPI.pay(b.id, { method: this.state.payMethod, ref: this.state.payRef });
                                    this.setState({ showPayFor:null, payMethod:'', payRef:'', message:'Payment marked as paid.' });
                                    this.loadBookings(this.username);
                                  } catch(e){
                                    const msg = e?.response?.data || e?.message || 'Failed to mark as paid';
                                    this.setState({ message: msg });
                                  }
                                }}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={()=>this.setState({ showPayFor:null, payMethod:'', payRef:'' })}>Cancel</button>
                              </div>
                            </div>
                          )}
                          {!this.isAdmin && b.renterUsername === this.username && b.paymentStatus === 'Paid' && (
                            <div className="mt-1">
                              <button className="btn btn-sm btn-outline-success" onClick={async ()=>{
                                try {
                                  await BookingAPI.settle(b.id);
                                  this.setState({ message:'Payment settled.' });
                                  this.loadBookings(this.username);
                                } catch(e){
                                  const msg = e?.response?.data || e?.message || 'Failed to settle payment';
                                  this.setState({ message: msg });
                                }
                              }}>Mark as Settled</button>
                            </div>
                          )}
                          {b.canReview && !this.state.reviewsGiven[b.id] && !this.isAdmin && (
                            <>
                              <button className="btn btn-sm btn-outline-primary mb-1" onClick={()=>this.submitReview(b.id, b.listingId)}>Review</button>
                              {this.state.showReviewForm === b.id && (
                                <div className="border rounded p-2 mt-2">
                                  <div className="mb-2">
                                    <label className="form-label mb-1">Rating (1-5):</label>
                                    <input type="number" min="1" max="5" className="form-control form-control-sm" value={this.state.reviewRating || ''} onChange={e=>this.setState({reviewRating:e.target.value})} />
                                  </div>
                                  <div className="mb-2">
                                    <label className="form-label mb-1">Comment:</label>
                                    <textarea className="form-control form-control-sm" rows="2" value={this.state.reviewComment || ''} onChange={e=>this.setState({reviewComment:e.target.value})} />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button className="btn btn-success btn-sm" onClick={()=>this.handleReviewSubmit(b.id, b.listingId)}>Submit</button>
                                    <button className="btn btn-secondary btn-sm" onClick={()=>this.setState({showReviewForm:null, reviewRating:'', reviewComment:''})}>Cancel</button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {b.canReview && this.state.reviewsGiven[b.id] && (
                            <span className="badge bg-info">Reviewed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {isRenter && (
          <div className="row mt-3">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">My Bookings</h5>
                </div>
                <div className="card-body">
                  {this.state.message && <div className="alert alert-info py-2">{this.state.message}</div>}
                  {myOwnBookings.length === 0 ? (
                    <p className="text-muted">No bookings made yet</p>
                  ) : (
                    myOwnBookings.map(b => (
                      <div key={b.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h6>{b.property}</h6>
                            <p className="mb-1 text-muted">{b.dates}</p>
                            <p className="mb-1 small text-muted">Renter: {b.renterUsername} | Customer: {b.customerUsername}</p>
                          </div>
                          <div className="text-end" style={{minWidth:'140px'}}>
                            <span className={`badge mb-1 ${b.status === 'Pending' ? 'bg-secondary' : b.status === 'Confirmed' ? 'bg-warning' : b.status === 'Completed' ? 'bg-success' : 'bg-danger'}`}>{b.status}</span>
                            <p className="mb-1 small text-muted">{b.amount}</p>
                            {b.paymentStatus && (
                              <div className="mb-1"><span className={`badge ${b.paymentStatus==='Unpaid'?'bg-secondary':b.paymentStatus==='Paid'?'bg-info':'bg-success'}`}>{b.paymentStatus}</span></div>
                            )}
                            {!this.isAdmin && b.customerUsername === this.username && b.status !== 'Cancelled' && b.paymentStatus === 'Unpaid' && (
                              <div className="mb-1">
                                <button className="btn btn-sm btn-outline-success" onClick={()=>this.setState({ showPayFor: b.id, payMethod: 'bkash', payRef: '' })}>Pay</button>
                              </div>
                            )}
                            {this.state.showPayFor === b.id && (
                              <div className="border rounded p-2 mt-2">
                                <div className="mb-2">
                                  <label className="form-label mb-1">Payment Method</label>
                                  <select className="form-select form-select-sm" value={this.state.payMethod||'bkash'} onChange={e=>this.setState({payMethod:e.target.value})}>
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="card">Card</option>
                                    <option value="cash">Cash</option>
                                  </select>
                                </div>
                                <div className="mb-2">
                                  <label className="form-label mb-1">Reference / Txn ID</label>
                                  <input className="form-control form-control-sm" value={this.state.payRef||''} onChange={e=>this.setState({payRef:e.target.value})} placeholder="e.g., TX123..." />
                                </div>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-success btn-sm" onClick={async ()=>{
                                    if ((this.state.payMethod || 'bkash') !== 'cash' && !this.state.payRef) {
                                      this.setState({ message: 'Please provide a payment reference/transaction ID.' });
                                      return;
                                    }
                                    try {
                                      await BookingAPI.pay(b.id, { method: this.state.payMethod, ref: this.state.payRef });
                                      this.setState({ showPayFor:null, payMethod:'', payRef:'', message:'Payment marked as paid.' });
                                      this.loadBookings(this.username);
                                    } catch(e){
                                      const msg = e?.response?.data || e?.message || 'Failed to mark as paid';
                                      this.setState({ message: msg });
                                    }
                                  }}>Save</button>
                                  <button className="btn btn-secondary btn-sm" onClick={()=>this.setState({ showPayFor:null, payMethod:'', payRef:'' })}>Cancel</button>
                                </div>
                              </div>
                            )}
                            {b.canReview && !this.state.reviewsGiven[b.id] && !this.isAdmin && (
                              <>
                                <button className="btn btn-sm btn-outline-primary mb-1" onClick={()=>this.submitReview(b.id, b.listingId)}>Review</button>
                                {this.state.showReviewForm === b.id && (
                                  <div className="border rounded p-2 mt-2">
                                    <div className="mb-2">
                                      <label className="form-label mb-1">Rating (1-5):</label>
                                      <input type="number" min="1" max="5" className="form-control form-control-sm" value={this.state.reviewRating || ''} onChange={e=>this.setState({reviewRating:e.target.value})} />
                                    </div>
                                    <div className="mb-2">
                                      <label className="form-label mb-1">Comment:</label>
                                      <textarea className="form-control form-control-sm" rows="2" value={this.state.reviewComment || ''} onChange={e=>this.setState({reviewComment:e.target.value})} />
                                    </div>
                                    <div className="d-flex gap-2">
                                      <button className="btn btn-success btn-sm" onClick={()=>this.handleReviewSubmit(b.id, b.listingId)}>Submit</button>
                                      <button className="btn btn-secondary btn-sm" onClick={()=>this.setState({showReviewForm:null, reviewRating:'', reviewComment:''})}>Cancel</button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            {b.canReview && this.state.reviewsGiven[b.id] && (
                              <span className="badge bg-info">Reviewed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  renderAnalytics = () => (
    <div className="row">
      <div className="col-md-3">
        <div className="card bg-primary text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.totalViews}</h3>
            <p className="mb-0">Total Views</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-success text-white shadow">
          <div className="card-body text-center">
            <h3>${this.state.analytics.totalEarnings}</h3>
            <p className="mb-0">Total Earnings</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-info text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.activeListings}</h3>
            <p className="mb-0">Active Listings</p>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card bg-warning text-white shadow">
          <div className="card-body text-center">
            <h3>{this.state.analytics.completedBookings}</h3>
            <p className="mb-0">Completed Bookings</p>
          </div>
        </div>
      </div>
    </div>
  )

  renderSettings = () => (
    <div className="card shadow">
      <div className="card-header"><h5>Personal Settings</h5></div>
      <div className="card-body">
        <form onSubmit={(e)=>e.preventDefault()}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={this.state.user.username} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={this.state.user.email} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={this.state.user.fullName} onChange={(e)=>this.setState({ user: { ...this.state.user, fullName: e.target.value }})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-control" value={this.state.user.phone} onChange={(e)=>this.setState({ user: { ...this.state.user, phone: e.target.value }})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" value={this.state.user.location} onChange={(e)=>this.setState({ user: { ...this.state.user, location: e.target.value }})} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <input type="password" className="form-control" value={this.state.oldPassword || ''} onChange={(e)=>this.setState({ oldPassword: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={this.state.newPassword || ''} onChange={(e)=>this.setState({ newPassword: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={this.state.confirmPassword || ''} onChange={(e)=>this.setState({ confirmPassword: e.target.value })} />
                {this.state.newPassword && this.state.confirmPassword && this.state.newPassword !== this.state.confirmPassword && (
                  <div className="form-text text-danger">New passwords do not match</div>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary" onClick={this.handleSaveProfile}>Save Profile</button>
            <button type="button" className="btn btn-outline-primary" onClick={this.handleChangePassword}>Change Password</button>
            {this.userType !== 'renter' && (
              <button type="button" className="btn btn-warning" onClick={this.handleRequestRenter}>Apply as Renter</button>
            )}
          </div>
          {this.state.message && (
            <div className="alert alert-info mt-3 py-2 mb-0">{this.state.message}</div>
          )}
        </form>
      </div>
    </div>
  )

  render() {
    if (this.state.isLoading) {
      return (
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <h2>Dashboard</h2>
            <p className="text-muted">Welcome back, {this.state.user.username}!</p>
          </div>
        </div>

    {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4 app-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('profile')}
            >
              Profile
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('listings')}
            >
      {this.userType === 'renter' ? 'Listings & Bookings' : 'Bookings'}
            </button>
          </li>
          {this.userType === 'renter' && (
            <li className="nav-item">
              <button 
                className={`nav-link ${this.state.activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => this.setActiveTab('analytics')}
              >
                Analytics
              </button>
            </li>
          )}
          <li className="nav-item">
            <button 
              className={`nav-link ${this.state.activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => this.setActiveTab('settings')}
            >
              Settings
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {this.state.activeTab === 'profile' && this.renderProfile()}
          {this.state.activeTab === 'listings' && this.renderListingsAndBookings()}
          {this.userType === 'renter' && this.state.activeTab === 'analytics' && this.renderAnalytics()}
          {this.state.activeTab === 'settings' && this.renderSettings()}
        </div>
      </div>
    );
  }
}
