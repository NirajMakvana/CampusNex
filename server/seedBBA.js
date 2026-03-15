require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Course');
require('./models/Faculty');
require('./models/Student');

const User       = require('./models/User');
const Department = require('./models/Department');
const Course     = require('./models/Course');
const Faculty    = require('./models/Faculty');
const Student    = require('./models/Student');
const Timetable  = require('./models/Timetable');
const Attendance = require('./models/Attendance');
const Exam       = require('./models/Exam');
const { Fee, FeeStructure } = require('./models/Fee');

const ACADEMIC_YEAR = '2024-25';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TIME_SLOTS = {
  Monday:    ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00','15:00-16:00'],
  Tuesday:   ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00','15:00-16:00'],
  Wednesday: ['09:00-10:00','10:00-11:00','11:15-12:15','14:00-15:00','15:00-16:00'],
  Thursday:  ['09:00-10:00','10:00-11:00','11:15-12:15','12:15-13:15','14:00-15:00'],
  Friday:    ['09:00-10:00','10:00-11:00','11:15-12:15','14:00-15:00','15:00-16:00'],
  Saturday:  ['09:00-10:00','10:00-11:00','11:15-12:15'],
};
const ROOMS = { 1: 'Room 102', 3: 'Room 202', 5: 'Room 302' };

// ── Name pools ────────────────────────────────────────────────────────────────
const firstNames = [
  'Aarav','Ishaan','Vihaan','Aditya','Siddharth','Aryan','Dhruv','Kabir','Reyansh','Vivaan',
  'Ananya','Diya','Kiara','Myra','Navya','Pari','Riya','Saanvi','Tara','Zara',
  'Bhavesh','Chirag','Darshan','Fenil','Gaurav','Hardik','Jignesh','Keval','Lokesh','Manav',
  'Neel','Omkar','Parth','Qasim','Ronak','Sahil','Tejas','Uday','Vatsal','Yash',
  'Aisha','Bhumi','Charmi','Drashti','Ekta','Foram','Grishma','Hetal','Isha','Jinal',
  'Khushi','Lata','Monal','Nidhi','Payal','Riddhi','Shruti','Tanvi','Urvi','Vidhi',
];
const lastNames = ['Shah','Patel','Mehta','Desai','Joshi','Trivedi','Modi','Chauhan','Rao','Singh',
  'Thakkar','Bhatt','Pandya','Parikh','Kapoor','Agarwal','Soni','Vyas','Dave','Nair'];

function randLast() { return lastNames[Math.floor(Math.random() * lastNames.length)]; }

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  // ── Check BBA doesn't already exist ──────────────────────────────────────
  const existing = await Department.findOne({ code: 'BBA' });
  if (existing) {
    console.log('BBA already exists. Cleaning up...');
    const bbaCourses = await Course.find({ department: existing._id });
    const bbaCourseIds = bbaCourses.map(c => c._id);
    const bbaFaculty = await Faculty.find({ department: existing._id });
    const bbaFacultyUserIds = bbaFaculty.map(f => f.userId);
    const bbaStudents = await Student.find({ department: existing._id });
    const bbaStudentUserIds = bbaStudents.map(s => s.userId);

    await Timetable.deleteMany({ department: existing._id });
    await Attendance.deleteMany({ course: { $in: bbaCourseIds } });
    await Exam.deleteMany({ course: { $in: bbaCourseIds } });
    await Fee.deleteMany({ student: { $in: bbaStudents.map(s => s._id) } });
    await FeeStructure.deleteMany({ department: existing._id });
    await Course.deleteMany({ department: existing._id });
    await Faculty.deleteMany({ department: existing._id });
    await Student.deleteMany({ department: existing._id });
    await User.deleteMany({ _id: { $in: [...bbaFacultyUserIds, ...bbaStudentUserIds] } });
    await Department.deleteOne({ _id: existing._id });
    console.log('✓ Old BBA data cleared');
  }

  // ── Department ────────────────────────────────────────────────────────────
  const dept = await Department.create({
    name: 'Bachelor of Business Administration',
    code: 'BBA',
    totalSeats: 60,
    description: 'BBA program covering management, marketing, finance, and entrepreneurship.',
  });
  console.log('✓ Department:', dept.name);

  // ── Courses (all 6 sems) ──────────────────────────────────────────────────
  const courseDefs = [
    // Sem 1
    { name: 'Principles of Management',        code: 'BBA101', semester: 1, credits: 4 },
    { name: 'Business Mathematics',            code: 'BBA102', semester: 1, credits: 4 },
    { name: 'Financial Accounting',            code: 'BBA103', semester: 1, credits: 4 },
    { name: 'Business Communication',          code: 'BBA104', semester: 1, credits: 2 },
    // Sem 2
    { name: 'Organisational Behaviour',        code: 'BBA201', semester: 2, credits: 4 },
    { name: 'Business Statistics',             code: 'BBA202', semester: 2, credits: 4 },
    { name: 'Cost Accounting',                 code: 'BBA203', semester: 2, credits: 4 },
    { name: 'Business Law',                    code: 'BBA204', semester: 2, credits: 3 },
    // Sem 3
    { name: 'Marketing Management',            code: 'BBA301', semester: 3, credits: 4 },
    { name: 'Human Resource Management',       code: 'BBA302', semester: 3, credits: 4 },
    { name: 'Financial Management',            code: 'BBA303', semester: 3, credits: 4 },
    { name: 'Business Environment',            code: 'BBA304', semester: 3, credits: 3 },
    // Sem 4
    { name: 'Consumer Behaviour',              code: 'BBA401', semester: 4, credits: 4 },
    { name: 'Operations Management',           code: 'BBA402', semester: 4, credits: 4 },
    { name: 'Corporate Finance',               code: 'BBA403', semester: 4, credits: 4 },
    { name: 'Research Methodology',            code: 'BBA404', semester: 4, credits: 3 },
    // Sem 5
    { name: 'Strategic Management',            code: 'BBA501', semester: 5, credits: 4 },
    { name: 'International Business',          code: 'BBA502', semester: 5, credits: 4 },
    { name: 'Digital Marketing',               code: 'BBA503', semester: 5, credits: 3, isElective: true },
    { name: 'Entrepreneurship Development',    code: 'BBA504', semester: 5, credits: 3, isElective: true },
    // Sem 6
    { name: 'Business Ethics & CSR',           code: 'BBA601', semester: 6, credits: 4 },
    { name: 'Project & Viva',                  code: 'BBA602', semester: 6, credits: 6 },
    { name: 'E-Commerce & Business',           code: 'BBA603', semester: 6, credits: 2 },
  ];

  const allCourses = await Course.insertMany(courseDefs.map(c => ({ ...c, department: dept._id })));
  const courseMap = {};
  allCourses.forEach(c => { courseMap[c.code] = c; });
  console.log(`✓ ${allCourses.length} courses created`);

  // ── Faculty ───────────────────────────────────────────────────────────────
  const facultyDefs = [
    {
      name: 'Dr. Meera Kapoor', email: 'meera@hod.bba.campusnex.edu',
      empId: 'BBA001', designation: 'Associate Professor', isHOD: true,
      salary: 55000, joiningDate: '2019-07-01',
      subjects: ['BBA101', 'BBA102'],
    },
    {
      name: 'Rajesh Trivedi', email: 'rajesh@faculty.bba.campusnex.edu',
      empId: 'BBA002', designation: 'Assistant Professor',
      salary: 46000, joiningDate: '2020-07-01',
      subjects: ['BBA103', 'BBA104', 'BBA301'],
    },
    {
      name: 'Sunita Desai', email: 'sunita@faculty.bba.campusnex.edu',
      empId: 'BBA003', designation: 'Lecturer',
      salary: 38000, joiningDate: '2021-07-01',
      subjects: ['BBA302', 'BBA303', 'BBA304'],
    },
    {
      name: 'Amit Vyas', email: 'amit.vyas@faculty.bba.campusnex.edu',
      empId: 'BBA004', designation: 'Assistant Professor',
      salary: 42000, joiningDate: '2022-07-01',
      subjects: ['BBA501', 'BBA502'],
    },
    {
      name: 'Dr. Priti Nair', email: 'priti@faculty.bba.campusnex.edu',
      empId: 'BBA005', designation: 'Professor',
      salary: 75000, joiningDate: '2017-07-01',
      subjects: ['BBA503', 'BBA504'],
    },
  ];

  const createdFaculty = [];
  for (const f of facultyDefs) {
    const user = await User.create({ name: f.name, email: f.email, password: 'Faculty@123', role: 'faculty' });
    const subjectIds = f.subjects.map(code => courseMap[code]?._id).filter(Boolean);
    const faculty = await Faculty.create({
      userId: user._id, employeeId: f.empId, department: dept._id,
      designation: f.designation, salary: f.salary,
      joiningDate: new Date(f.joiningDate), subjects: subjectIds,
    });
    for (const code of f.subjects) {
      await Course.findByIdAndUpdate(courseMap[code]?._id, { faculty: faculty._id });
    }
    createdFaculty.push({ ...f, doc: faculty });
    console.log(`  ✓ Faculty: ${f.name} | ${f.subjects.join(', ')}`);
  }

  const hod = createdFaculty.find(f => f.isHOD);
  await Department.findByIdAndUpdate(dept._id, { hod: hod.doc._id });
  console.log('✓ HOD assigned:', hod.name);

  // ── Students (20 each in Sem 1, 3, 5) ────────────────────────────────────
  const semConfigs = [
    { sem: 1, batch: '2024-27', startIdx: 0 },
    { sem: 3, batch: '2023-26', startIdx: 20 },
    { sem: 5, batch: '2022-25', startIdx: 40 },
  ];

  const createdStudents = { 1: [], 3: [], 5: [] };
  let studentCount = 0;

  for (const { sem, batch, startIdx } of semConfigs) {
    for (let i = 0; i < 20; i++) {
      const idx = startIdx + i;
      const firstName = firstNames[idx % firstNames.length];
      const lastName  = randLast();
      const name      = `${firstName} ${lastName}`;
      const enroll    = `BBA${batch.slice(0,4)}${String(idx + 1).padStart(3,'0')}`;
      const email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@bba.student.campusnex.edu`;
      const gender    = idx % 2 === 0 ? 'male' : 'female';

      const existing = await User.findOne({ email });
      if (existing) continue;

      const user = await User.create({ name, email, password: 'Campus@123', role: 'student' });
      const student = await Student.create({
        userId: user._id, enrollmentNo: enroll,
        department: dept._id, semester: sem,
        batch, gender,
      });
      createdStudents[sem].push(student);
      studentCount++;
    }
  }
  console.log(`✓ ${studentCount} BBA students created (20 each in Sem 1, 3, 5)`);

  // ── Timetable (Sem 1, 3, 5 only) ─────────────────────────────────────────
  for (const sem of [1, 3, 5]) {
    const courses = await Course.find({
      department: dept._id, semester: sem, faculty: { $exists: true, $ne: null }
    }).populate('faculty');

    let courseIdx = 0;
    for (const day of DAYS) {
      const times = TIME_SLOTS[day];
      const slots = times.map(time => {
        const course = courses[courseIdx++ % courses.length];
        return { time, course: course._id, faculty: course.faculty._id, room: ROOMS[sem] };
      });
      await Timetable.findOneAndUpdate(
        { department: dept._id, semester: sem, day, academicYear: ACADEMIC_YEAR },
        { department: dept._id, semester: sem, day, slots, academicYear: ACADEMIC_YEAR },
        { upsert: true, new: true }
      );
    }
    console.log(`✓ Timetable created for Sem ${sem}`);
  }

  // ── Attendance (today for all Sem 1,3,5 courses) ──────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let attCount = 0;

  for (const sem of [1, 3, 5]) {
    const courses = await Course.find({ department: dept._id, semester: sem });
    const students = createdStudents[sem];
    if (students.length === 0) continue;

    for (const course of courses) {
      const records = students.map((s, i) => ({
        student: s._id,
        course: course._id,
        date: today,
        status: i % 7 === 0 ? 'absent' : i % 11 === 0 ? 'late' : 'present',
        markedBy: course.faculty,
      }));
      await Attendance.insertMany(records, { ordered: false }).catch(() => {});
      attCount += records.length;
    }
  }
  console.log(`✓ ${attCount} attendance records created`);

  // ── Exams (April 2026) ────────────────────────────────────────────────────
  const examSchedule = [
    { code: 'BBA101', type: 'end',      date: '2026-04-02', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA102', type: 'end',      date: '2026-04-02', time: '14:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA103', type: 'end',      date: '2026-04-04', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA104', type: 'internal', date: '2026-04-04', time: '14:00', hall: 'Hall E', duration: 60,  total: 30,  passing: 12 },
    { code: 'BBA301', type: 'end',      date: '2026-04-08', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA302', type: 'end',      date: '2026-04-08', time: '14:00', hall: 'Hall E', duration: 180, total: 100, passing: 40 },
    { code: 'BBA303', type: 'end',      date: '2026-04-10', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA304', type: 'internal', date: '2026-04-11', time: '14:00', hall: 'Hall E', duration: 60,  total: 30,  passing: 12 },
    { code: 'BBA501', type: 'end',      date: '2026-04-15', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA502', type: 'end',      date: '2026-04-15', time: '14:00', hall: 'Hall E', duration: 180, total: 100, passing: 40 },
    { code: 'BBA503', type: 'end',      date: '2026-04-17', time: '10:00', hall: 'Hall D', duration: 180, total: 100, passing: 40 },
    { code: 'BBA504', type: 'end',      date: '2026-04-18', time: '14:00', hall: 'Hall E', duration: 180, total: 100, passing: 40 },
    { code: 'BBA101', type: 'mid',      date: '2026-04-24', time: '10:00', hall: 'Hall E', duration: 90,  total: 50,  passing: 20 },
    { code: 'BBA301', type: 'mid',      date: '2026-04-24', time: '14:00', hall: 'Hall E', duration: 90,  total: 50,  passing: 20 },
    { code: 'BBA501', type: 'mid',      date: '2026-04-25', time: '10:00', hall: 'Hall E', duration: 90,  total: 50,  passing: 20 },
  ];

  let examCount = 0;
  for (const s of examSchedule) {
    const courseDoc = courseMap[s.code];
    if (!courseDoc) continue;
    const [yr, mo, dy] = s.date.split('-');
    const [hr, mn] = s.time.split(':');
    await Exam.create({
      course: courseDoc._id,
      type: s.type,
      date: new Date(yr, mo - 1, dy, hr, mn),
      totalMarks: s.total,
      passingMarks: s.passing,
      hall: s.hall,
      duration: s.duration,
      academicYear: ACADEMIC_YEAR,
    });
    examCount++;
  }
  console.log(`✓ ${examCount} exams scheduled`);

  // ── Fee Structures + Records ──────────────────────────────────────────────
  const feeStructures = await FeeStructure.insertMany([
    { department: dept._id, semester: 1, amount: 42000, academicYear: ACADEMIC_YEAR, description: 'BBA Sem 1 Tuition Fee' },
    { department: dept._id, semester: 3, amount: 42000, academicYear: ACADEMIC_YEAR, description: 'BBA Sem 3 Tuition Fee' },
    { department: dept._id, semester: 5, amount: 45000, academicYear: ACADEMIC_YEAR, description: 'BBA Sem 5 Tuition Fee' },
  ]);
  const structMap = {};
  feeStructures.forEach(s => { structMap[s.semester] = s; });

  const allBBAStudents = await Student.find({ department: dept._id, semester: { $in: [1, 3, 5] } });
  const feeRecords = [];
  allBBAStudents.forEach((s, idx) => {
    const struct = structMap[s.semester];
    if (!struct) return;
    const r = Math.random();
    const status = r < 0.60 ? 'paid' : r < 0.85 ? 'pending' : 'overdue';
    feeRecords.push({
      student: s._id,
      feeStructure: struct._id,
      amount: struct.amount,
      discount: idx % 10 === 0 ? 2000 : 0,
      dueDate: new Date('2026-03-31'),
      paidDate: status === 'paid' ? new Date(Date.now() - Math.random() * 60 * 86400000) : null,
      status,
      transactionId: status === 'paid' ? `TXNBBA${Date.now()}${idx}` : null,
      paymentMethod: status === 'paid' ? ['online','cash','cheque'][idx % 3] : null,
    });
  });
  await Fee.insertMany(feeRecords);
  console.log(`✓ ${feeRecords.length} fee records created`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ BBA seed complete!');
  console.log('─────────────────────────────────────────────────────────');
  console.log('HOD:     meera@hod.bba.campusnex.edu     / Faculty@123');
  console.log('Faculty: rajesh@faculty.bba.campusnex.edu / Faculty@123');
  console.log('Student: <name>.<lastname><idx>@bba.student.campusnex.edu / Campus@123');
  console.log('─────────────────────────────────────────────────────────');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
