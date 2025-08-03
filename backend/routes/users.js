const router = require('express').Router();
const { model } = require('mongoose');
const User = require('../models/user.model');

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const username = req.body.username;
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    const userType = req.body.userType || 'customer'; // Default to customer if not specified
    
    // Check if username already exists
    User.findOne({ username: username })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json('Username already exists. Please choose a different username.');
            }
            
            // Check if email already exists
            return User.findOne({ email: email });
        })
        .then(existingEmail => {
            if (existingEmail) {
                return res.status(400).json('Email already exists. Please use a different email address.');
            }
            
            const newUser = new User({
                username,
                fullName,
                email,
                password,
                userType
            });

            return newUser.save();
        })
        .then(() => res.json('User added!'))
        .catch(err => {
            console.error('Error creating user:', err);
            res.status(400).json('Error: ' + err.message);
        });
});

router.route('/login').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                return res.status(400).json('User not found');
            }
            
            // Simple password check (in production, use bcrypt for hashed passwords)
            if (user.password === password) {
                res.json({
                    message: 'Login successful',
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    userType: user.userType,
                    isAdmin: user.username === 'admin' // Check if user is admin
                });
            } else {
                res.status(400).json('Invalid password');
            }
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// Admin routes - Update user
router.route('/admin/update/:id').put((req, res) => {
    // Simple admin check (in production, use proper JWT authentication)
    if (req.body.adminUsername !== 'admin') {
        return res.status(403).json('Access denied. Admin privileges required.');
    }
    
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).json('User not found');
            }
            
            user.username = req.body.username || user.username;
            user.fullName = req.body.fullName || user.fullName;
            user.email = req.body.email || user.email;
            user.userType = req.body.userType || user.userType;
            
            // Only update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }
            
            return user.save();
        })
        .then(() => res.json('User updated successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Admin routes - Delete user
router.route('/admin/delete/:id').delete((req, res) => {
    // Simple admin check (in production, use proper JWT authentication)
    if (req.body.adminUsername !== 'admin') {
        return res.status(403).json('Access denied. Admin privileges required.');
    }
    
    User.findByIdAndDelete(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).json('User not found');
            }
            res.json('User deleted successfully!');
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;