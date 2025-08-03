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
    const email = req.body.email;
    const password = req.body.password;
    const newUser = new User({
        username,
        email,
        password
    });

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
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
                    email: user.email
                });
            } else {
                res.status(400).json('Invalid password');
            }
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;