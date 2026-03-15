require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Faculty');
const Course    = require('./models/Course');
const Timetable = require('./models/Timetable');
const Department = require('./models/Department');

const ACADEMIC_YEAR = '2024-25';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Time slots — different pattern per day to avoid monotony
const TIME_SLOTS = {
  Monday:    ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00','15:00-16:00'],
  Tuesday:   ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00','15:00-16:00'],
  Wednesday: ['09:00-10:00','10:00-11:00','11:15-12:15','14:00-15:00','15:00-16:00'],
  Thursday:  ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00'],
  Friday:    ['09:00-10:00','10:00-11:00','11:15-12:15','14:00-15:00','15:00-16:00'],
  Saturday:  ['09:00-10:00','10:00-11:00','11:15-12:15'],
};

// Rooms
const ROOMS = { 1: 'Room 101', 3: 'Room 201', 5: 'Room 301' };

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected');

  const dept = await Department.findOne({ code: 'BCA' });
  if (!dept) { console.error('BCA department not found. Run seedData.js first.'); process.exit(1); }

  // Clear existing timetable for these sems
  await Timetable.deleteMany({ department: dept._id, academicYear: ACADEMIC_YEAR });
  console.log('✓ Cleared old timetable');

  for (const sem of [1, 3, 5]) {
    // Get courses for this sem that have faculty assigned
    const courses = await Course.find({ department: dept._id, semester: sem, faculty: { $exists: true, $ne: null } })
      .populate('faculty');

    if (courses.length === 0) {
      console.log(`  ⚠ No courses with faculty for Sem ${sem}, skipping`);
      continue;
    }

    console.log(`\n── Sem ${sem} (${courses.length} courses) ──`);

    let courseIdx = 0;
    for (const day of DAYS) {
      const times = TIME_SLOTS[day];
      const slots = [];

      for (const time of times) {
        const course = courses[courseIdx % courses.length];
        courseIdx++;
        slots.push({
          time,
          course: course._id,
          faculty: course.faculty._id,
          room: ROOMS[sem],
        });
      }

      await Timetable.findOneAndUpdate(
        { department: dept._id, semester: sem, day, academicYear: ACADEMIC_YEAR },
        { department: dept._id, semester: sem, day, slots, academicYear: ACADEMIC_YEAR },
        { upsert: true, new: true }
      );
      console.log(`  ✓ Sem ${sem} ${day} — ${slots.length} slots`);
    }
  }

  console.log('\n✅ Timetable seed complete!');
  console.log(`Academic Year: ${ACADEMIC_YEAR}`);
  console.log('Semesters: 1, 3, 5 only (2, 4, 6 skipped — not running)');
  process.exit(0);
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
