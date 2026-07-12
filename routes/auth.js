const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');
const protect = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, (req, res) => res.json({ admin: req.admin }));

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!(await bcrypt.compare(currentPassword, admin.password)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
