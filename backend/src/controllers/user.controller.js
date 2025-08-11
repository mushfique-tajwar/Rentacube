const userService = require('../services/user.service');

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.register = async (req, res) => {
  const { username, fullName, email, password, userType = 'customer', phone = '', location = '' } = req.body;
  try {
    if (await userService.findByUsername(username)) return res.status(400).json('Username already exists');
    if (await userService.findByEmail(email)) return res.status(400).json('Email already exists');
  const approvalStatus = userType === 'renter' ? 'pending' : 'approved';
  const user = await userService.create({ username, fullName, email, password, userType, phone, location, approvalStatus });
  res.json({ message: 'User added!', username: user.username, fullName: user.fullName, userType: user.userType, phone: user.phone, location: user.location, approvalStatus: user.approvalStatus, isAdmin: user.username === 'admin' });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(400).json('User not found');
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json('Invalid password');
    res.json({ message: 'Login successful', username: user.username, fullName: user.fullName, email: user.email, userType: user.userType, approvalStatus: user.approvalStatus, phone: user.phone, location: user.location, isAdmin: user.username === 'admin' });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.pendingRenters = async (req, res) => {
  if (req.query.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const users = await userService.find({ userType: 'renter', approvalStatus: 'pending' });
    res.json(users);
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.setApproval = async (req, res) => {
  if (req.body.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const user = await userService.findById(req.params.id);
    if (!user) return res.status(404).json('User not found');
    if (user.userType !== 'renter') return res.status(400).json('Only renters require approval');
    user.approvalStatus = req.body.status === 'approved' ? 'approved' : req.body.status === 'rejected' ? 'rejected' : user.approvalStatus;
    await user.save();
    res.json({ message: 'Approval updated', approvalStatus: user.approvalStatus });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.updateProfile = async (req, res) => {
  const { username, fullName, phone, location } = req.body;
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(404).json('User not found');
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    await user.save();
    res.json({ message: 'Profile updated', fullName: user.fullName, phone: user.phone, location: user.location });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(404).json('User not found');
    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(400).json('Old password incorrect');
    user.password = newPassword;
    await user.save();
    res.json('Password changed');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.requestRenter = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await userService.findByUsername(username);
    if (!user) return res.status(404).json('User not found');
    if (user.userType === 'renter' && user.approvalStatus === 'approved') {
      return res.status(400).json('Already a renter');
    }
    user.userType = 'renter';
    user.approvalStatus = 'pending';
    await user.save();
    res.json({ message: 'Renter request submitted for approval', approvalStatus: user.approvalStatus, userType: user.userType });
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
