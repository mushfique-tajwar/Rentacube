const User = require('../models/User');

module.exports = {
  findAll: () => User.find(),
  findByUsername: (username) => User.findOne({ username }),
  findByEmail: (email) => User.findOne({ email }),
  create: (data) => new User(data).save(),
  findById: (id) => User.findById(id),
  deleteById: (id) => User.findByIdAndDelete(id)
};
