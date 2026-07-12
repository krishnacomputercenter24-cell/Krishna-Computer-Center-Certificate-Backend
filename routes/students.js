const router  = require('express').Router();
const Student = require('../models/Student');
const protect = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 15 } = req.query;
    const q = search ? { $or: [
      { name: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ]} : {};
    const [total, students] = await Promise.all([
      Student.countDocuments(q),
      Student.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    ]);
    res.json({ students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Student not found' });
    res.json(s);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { studentId } = req.body;
    if (await Student.findOne({ studentId: studentId?.toUpperCase() }))
      return res.status(400).json({ message: 'Student ID already exists' });
    const s = await Student.create({ ...req.body, studentId: studentId.toUpperCase() });
    res.status(201).json({ message: 'Student created', student: s });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Updated', student: s });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    if (!(await Student.findByIdAndDelete(req.params.id)))
      return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
