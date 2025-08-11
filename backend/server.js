const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use('/users', require('./src/routes/user.routes'));
app.use('/listings', require('./src/routes/listing.routes'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));