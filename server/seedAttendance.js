require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Faculty');
const Course     = require('./models/Course');
const Student    = require('./models/Student');
const Attendance = require('./models/Attendance');
const Faculty    = require('./models/Faculty');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString().split('T')[0];

  // Delete today's attendance if any (re-seed safe)
  await Attendance.deleteMany({ date: today });
  console.log(`✓ Cleared today's attendance (${dateStr})`);

  // Get running semesters' courses (1, 3, 5) with faculty
  const courses = await Course.find({
    semester: { $in: [1, 3, 5] },
    faculty: { $exists: true, $ne: null },
  }).populate('faculty');

  if (courses.length === 0) {
    console.error('No courses found. Run seedData.js first.');
    process.exit(1);
  }

  let total = 0;

  for (const course of courses) {
    // Get students of same semester
    const students = await Student.find({ semester: course.semester });
    if (students.length === 0) continue;

    const records = [];
    students.forEach((s, idx) => {
      // Realistic distribution: ~80% present, ~12% absent, ~8% late
      let status;
      const r = Math.random();
      if (r < 0.80) status = 'present';
      else if (r < 0.92) status = 'absent';
      else status = 'late';

      records.push({
        student: s._id,
        course: course._id,
        date: today,
        status,
        markedBy: course.faculty._id,
      });
    });

    await Attendance.insertMany(records, { ordered: false });
    const p = records.filter(r => r.status === 'present').length;
    const a = records.filter(r => r.status === 'absent').length;
    const l = records.filter(r => r.status === 'late').length;
    console.log(`  ✓ ${course.code} (Sem ${course.semester}) — P:${p} A:${a} L:${l}`);
    total += records.length;
  }

  console.log(`\n✅ Done! ${total} attendance records for ${dateStr}`);
  process.exit(0);
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
