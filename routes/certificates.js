const router      = require('express').Router();
const QRCode      = require('qrcode');
const Certificate = require('../models/Certificate');
const Student     = require('../models/Student');
const Course      = require('../models/Course');
const protect     = require('../middleware/auth');

const genNo = () => `KCC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

/* ── Dashboard stats ── */
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [totalCerts, totalStudents, totalCourses, monthCerts, recentCerts] = await Promise.all([
      Certificate.countDocuments({ isRevoked: false }),
      Student.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Certificate.countDocuments({ createdAt: { $gte: monthStart }, isRevoked: false }),
      Certificate.find({ isRevoked: false })
        .populate('student', 'name studentId')
        .populate('course', 'name code')
        .sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ totalCerts, totalStudents, totalCourses, monthCerts, recentCerts });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Public verify (no auth) ── */
router.get('/verify/:certNo', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.certNo })
      .populate('student', 'name studentId fatherName')
      .populate('course', 'name code duration');
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    if (cert.isRevoked) return res.json({ valid: false, message: 'Certificate has been revoked' });
    res.json({
      valid: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        studentName:    cert.student.name,
        studentId:      cert.student.studentId,
        fatherName:     cert.student.fatherName,
        courseName:     cert.course.name,
        courseCode:     cert.course.code,
        duration:       cert.course.duration,
        grade:          cert.grade,
        percentage:     cert.percentage,
        issueDate:      cert.issueDate,
        completionDate: cert.completionDate,
        issuedBy:       'Krishna Computer Center, Kasna',
        website:        'https://krishnacomputercenterkasna.com',
      }
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── List ── */
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const [total, certificates] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.find()
        .populate('student', 'name studentId')
        .populate('course', 'name code duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
    ]);
    res.json({ certificates, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Get one ── */
router.get('/:id', protect, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('student').populate('course');
    if (!cert) return res.status(404).json({ message: 'Not found' });
    res.json(cert);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Generate ── */
router.post('/generate', protect, async (req, res) => {
  try {
    const { studentId, courseId, grade, percentage, completionDate, remarks } = req.body;

    const [student, course] = await Promise.all([Student.findById(studentId), Course.findById(courseId)]);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!course)  return res.status(404).json({ message: 'Course not found' });

    if (await Certificate.findOne({ student: studentId, course: courseId, isRevoked: false }))
      return res.status(400).json({ message: 'Certificate already issued for this student & course' });

    let certNumber, tries = 0;
    do { certNumber = genNo(); tries++; }
    while (await Certificate.findOne({ certificateNumber: certNumber }) && tries < 20);

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certNumber}`;
    const qrCode = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H', margin: 1, width: 200,
      color: { dark: '#0a1a52', light: '#ffffff' },
    });

    const cert = await Certificate.create({
      certificateNumber: certNumber, student: studentId, course: courseId,
      grade, percentage, completionDate, remarks,
      issuedBy: req.admin.name, qrCode, issueDate: new Date(),
    });

    const populated = await Certificate.findById(cert._id).populate('student').populate('course');
    res.status(201).json({ message: 'Certificate generated', certificate: populated });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Revoke ── */
router.put('/:id/revoke', protect, async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, { isRevoked: true }, { new: true });
    if (!cert) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Certificate revoked', cert });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
