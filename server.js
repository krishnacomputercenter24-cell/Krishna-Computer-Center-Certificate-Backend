// import dotenv from 'dotenv'; 
// dotenv.config();
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/courses',      require('./routes/courses'));
app.use('/api/certificates', require('./routes/certificates'));
app.get('/api/health', (_, res) => res.json({ status: 'OK', message: 'KCC API running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅  MongoDB connected');

    const bcrypt  = require('bcryptjs');
    const Admin   = require('./models/Admin');
    const Course  = require('./models/Course');

    if (!(await Admin.findOne({ email: process.env.ADMIN_EMAIL }))) {
      await Admin.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      });
      console.log('✅  Default admin seeded:', process.env.ADMIN_EMAIL);
    }

    if ((await Course.countDocuments()) === 0) {
      await Course.insertMany([
        { name: 'Basic Computer Course',          code: 'BCC', duration: '3 Months' },
        { name: 'Diploma in Computer Application', code: 'DCA', duration: '6 Months'   },
        { name: 'Advanced Diploma Computer Course',        code: 'ADCC', duration: '1 Year' },
        { name: 'Tally Prime Course',               code: 'TPC', duration: '3 Months' },
        // { name: 'Web Design & Development',        code: 'WDD', duration: '6 Months' },
        // { name: 'Cyber Security Basics',           code: 'CSB', duration: '2 Months' },
        // { name: 'Digital Marketing',               code: 'DM',  duration: '3 Months' },
        // { name: 'Programming in C/C++',            code: 'PCC', duration: '4 Months' },
        // { name: 'Python Programming',              code: 'PY',  duration: '4 Months' },
        // { name: 'Hardware & Networking',           code: 'HN',  duration: '6 Months' },
      ]);
      console.log('✅  Courses seeded');
    }
  })
  .catch(err => console.error('❌  MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
