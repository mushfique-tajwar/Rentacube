# Rentacube - Rental Marketplace Platform

A comprehensive MERN stack rental marketplace where users can list items for rent and customers can book them.

## Features

### User Management
- User registration and authentication
- User roles: Renter (Host), Customer (Rentee), Admin
- Profile management and dashboard
- Password recovery via email

### Item Listing Management
- Create, edit, and delete listings
- Multiple image upload with cloud storage
- Categories, location, pricing, and availability

### Booking System
- Date-based booking with availability checking
- Booking status tracking (Pending, Confirmed, Cancelled, Completed)
- Booking history for both renters and customers

### Search & Filtering
- Keyword search
- Filter by category, location, price range, dates, and ratings

### Review & Rating System
- Post-booking reviews and ratings
- Display ratings on listing pages

### Admin Control Panel
- User management
- Listing moderation
- Platform analytics and monitoring

### Analytics Dashboard
- Profit/loss tracking for companies/shops
- User analytics and insights
- Performance metrics

### Chatbot
- 24/7 user assistance
- FAQ support
- Navigation help

## Tech Stack

### Frontend
- React.js with Hooks
- Redux for state management
- Material-UI for components
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for image storage
- Nodemailer for email services

### Additional Services
- Chatbot integration
- Payment processing
- Email notifications

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rentacube.git
cd rentacube
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# Create .env file in backend directory
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development servers:
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm start
```

## Project Structure

```
rentacube/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
