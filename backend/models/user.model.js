const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /.+\@.+\..+/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    userType: {
        type: String,
        required: true,
        enum: ['renter', 'lister'],
        default: 'renter'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;