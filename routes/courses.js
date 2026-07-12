const router  = require('express').Router();
const Course  = require('../models/Course');
const protect = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { res.json(await Course.find({ isActive: true }).sort({ name: 1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, code } = req.body;
    if (await Course.findOne({ $or: [{ name }, { code: code?.toUpperCase() }] }))
      return res.status(400).json({ message: 'Course name or code already exists' });
    const c = await Course.create({ ...req.body, code: code.toUpperCase() });
    res.status(201).json({ message: 'Course created', course: c });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const c = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Updated', course: c });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Course deactivated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
