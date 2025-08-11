const userService = require('../services/user.service');

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.register = async (req, res) => {
  const { username, fullName, email, password, userType = 'customer' } = req.body;
  try {
    if (await userService.findByUsername(username)) return res.status(400).json('Username already exists');
    if (await userService.findByEmail(email)) return res.status(400).json('Email already exists');
    await userService.create({ username, fullName, email, password, userType });
    res.json('User added!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(400).json('User not found');
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json('Invalid password');
    res.json({ message: 'Login successful', username: user.username, fullName: user.fullName, email: user.email, userType: user.userType, isAdmin: user.username === 'admin' });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.adminUpdate = async (req, res) => {
  if (req.body.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json('User not found');
    Object.assign(user, {
      username: req.body.username || user.username,
      fullName: req.body.fullName || user.fullName,
      email: req.body.email || user.email,
      userType: req.body.userType || user.userType
    });
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json('User updated successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.adminDelete = async (req, res) => {
  if (req.body.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const user = await userService.deleteById(req.params.id);
    if (!user) return res.status(404).json('User not found');
    res.json('User deleted successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};
