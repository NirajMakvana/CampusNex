require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Faculty');
const Course = require('./models/Course');
const Exam   = require('./models/Exam');

const ACADEMIC_YEAR = '2024-25';

// April 2026 exam schedule — Sem 1, 3, 5
// Mon-Sat, 2 exams per day (morning + afternoon), skip Sundays
const SCHEDULE = [
  // Sem 1 — End Semester (April 1–5)
  { code: 'BCA101', type: 'end',      date: '2026-04-01', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA102', type: 'end',      date: '2026-04-01', time: '14:00', hall: 'Hall B', duration: 180, total: 100, passing: 40 },
  { code: 'BCA103', type: 'end',      date: '2026-04-03', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA104', type: 'internal', date: '2026-04-03', time: '14:00', hall: 'Hall C', duration: 60,  total: 30,  passing: 12 },

  // Sem 3 — End Semester (April 7–12)
  { code: 'BCA301', type: 'end',      date: '2026-04-07', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA302', type: 'end',      date: '2026-04-07', time: '14:00', hall: 'Hall B', duration: 180, total: 100, passing: 40 },
  { code: 'BCA303', type: 'end',      date: '2026-04-09', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA304', type: 'practical',date: '2026-04-10', time: '10:00', hall: 'Lab 1',  duration: 120, total: 50,  passing: 20 },

  // Sem 5 — End Semester (April 14–19)
  { code: 'BCA501', type: 'end',      date: '2026-04-14', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA502', type: 'end',      date: '2026-04-14', time: '14:00', hall: 'Hall B', duration: 180, total: 100, passing: 40 },
  { code: 'BCA503', type: 'end',      date: '2026-04-16', time: '10:00', hall: 'Hall A', duration: 180, total: 100, passing: 40 },
  { code: 'BCA504', type: 'practical',date: '2026-04-17', time: '10:00', hall: 'Lab 2',  duration: 120, total: 50,  passing: 20 },

  // Mid-term for all (April 21–24)
  { code: 'BCA101', type: 'mid', date: '2026-04-21', time: '10:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
  { code: 'BCA103', type: 'mid', date: '2026-04-21', time: '14:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
  { code: 'BCA301', type: 'mid', date: '2026-04-22', time: '10:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
  { code: 'BCA303', type: 'mid', date: '2026-04-22', time: '14:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
  { code: 'BCA501', type: 'mid', date: '2026-04-23', time: '10:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
  { code: 'BCA502', type: 'mid', date: '2026-04-23', time: '14:00', hall: 'Hall C', duration: 90, total: 50, passing: 20 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected');

  // Clear April exams
  await Exam.deleteMany({
    date: { $gte: new Date('2026-04-01'), $lte: new Date('2026-04-30') },
    academicYear: ACADEMIC_YEAR,
  });
  console.log('✓ Cleared April exams');

  // Build course code -> _id map
  const courses = await Course.find({});
  const courseMap = {};
  courses.forEach(c => { courseMap[c.code] = c._id; });

  let created = 0;
  for (const s of SCHEDULE) {
    const courseId = courseMap[s.code];
    if (!courseId) { console.log(`  ⚠ Course not found: ${s.code}`); continue; }

    const [year, month, day] = s.date.split('-');
    const [hour, min] = s.time.split(':');
    const date = new Date(year, month - 1, day, hour, min);

    await Exam.create({
      course: courseId,
      type: s.type,
      date,
      totalMarks: s.total,
      passingMarks: s.passing,
      hall: s.hall,
      duration: s.duration,
      academicYear: ACADEMIC_YEAR,
    });

    console.log(`  ✓ ${s.code} | ${s.type.padEnd(9)} | ${s.date} ${s.time} | ${s.hall}`);
    created++;
  }

  console.log(`\n✅ ${created} exams scheduled for April 2026`);
  console.log('Types: end-semester, mid-term, internal, practical');
  process.exit(0);
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
