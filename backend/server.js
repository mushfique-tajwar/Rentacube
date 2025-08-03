const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const url = process.env.ATLAS_URI;
console.log('Connecting to MongoDB with URL:', url);
mongoose.connect(url);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.use('/users', require('./routes/users'));
app.use('/listings', require('./routes/listings'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});