const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/users', require('./src/routes/user.routes'));
app.use('/listings', require('./src/routes/listing.routes'));
app.use('/bookings', require('./src/routes/booking.routes'));
app.use('/reviews', require('./src/routes/review.routes'));

// Periodic job: auto-complete bookings that have passed their end date
const bookingService = require('./src/services/booking.service');
const runAutoComplete = async () => {
	try {
		const count = await bookingService.autoCompleteDue();
		if (count) console.log(`[AutoComplete] Completed ${count} overdue bookings`);
	} catch (e) {
		console.error('[AutoComplete] Error:', e.message);
	}
};
// Run once on startup and then hourly
runAutoComplete();
setInterval(runAutoComplete, 60 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));