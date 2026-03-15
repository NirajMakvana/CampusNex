require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Course');
require('./models/Faculty');
require('./models/Student');

const User = require('./models/User');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');

// ── Helpers ────────────────────────────────────────────────────────────────
const firstNames = ['Arjun','Pooja','Karan','Nisha','Dev','Riya','Harsh','Priya','Raj','Meera',
  'Vivek','Sneha','Amit','Kavya','Rohan','Divya','Nikhil','Ananya','Siddharth','Ishaan',
  'Tanvi','Yash','Shruti','Kunal','Neha','Aditya','Simran','Varun','Deepika','Manish',
  'Ankita','Rahul','Swati','Akash','Pallavi','Tushar','Komal','Gaurav','Bhavna','Chirag',
  'Heena','Parth','Foram','Dhruv','Khushi','Mihir','Riddhi','Jayesh','Nidhi','Tejas',
  'Monika','Vishal','Hetal','Sachin','Jinal','Pratik','Drashti','Nilesh','Payal','Ruchit'];

const lastNames = ['Shah','Patel','Mehta','Desai','Joshi','Trivedi','Modi','Chauhan','Rao','Singh',
  'Kumar','Sharma','Verma','Gupta','Mishra','Pandey','Tiwari','Yadav','Chaudhary','Soni'];

function randLast() { return lastNames[Math.floor(Math.random() * lastNames.length)]; }

function makeStudents(sem, batch, count, startIdx) {
  return Array.from({ length: count }, (_, i) => {
    const idx = startIdx + i;
    const firstName = firstNames[idx % firstNames.length];
    const lastName = randLast();
    const name = `${firstName} ${lastName}`;
    const enroll = `BCA${batch.slice(0,4)}${String(idx + 1).padStart(3,'0')}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@student.campusnex.edu`;
    return { name, email, enroll, sem, batch, gender: idx % 2 === 0 ? 'male' : 'female' };
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  // ── Clean ────────────────────────────────────────────────────────────────
  await Course.deleteMany({});
  await Faculty.deleteMany({});
  await Student.deleteMany({});
  await Department.deleteMany({});
  await User.deleteMany({ role: { $in: ['faculty', 'student'] } });
  console.log('✓ Cleared old data');

  // ── Department ───────────────────────────────────────────────────────────
  const dept = await Department.create({
    name: 'Bachelor of Computer Applications',
    code: 'BCA',
    totalSeats: 60,
    description: 'BCA program focusing on computer applications, programming, and software development.',
  });
  console.log('✓ Department:', dept.name);

  // ── Courses (all 6 sems) ─────────────────────────────────────────────────
  const courseDefs = [
    { name: 'Fundamentals of Computers',        code: 'BCA101', semester: 1, credits: 4 },
    { name: 'Mathematics I',                     code: 'BCA102', semester: 1, credits: 4 },
    { name: 'Programming in C',                  code: 'BCA103', semester: 1, credits: 4 },
    { name: 'Communication Skills',              code: 'BCA104', semester: 1, credits: 2 },
    { name: 'Data Structures',                   code: 'BCA201', semester: 2, credits: 4 },
    { name: 'Mathematics II',                    code: 'BCA202', semester: 2, credits: 4 },
    { name: 'Object Oriented Programming (C++)', code: 'BCA203', semester: 2, credits: 4 },
    { name: 'Digital Electronics',               code: 'BCA204', semester: 2, credits: 3 },
    { name: 'Database Management Systems',       code: 'BCA301', semester: 3, credits: 4 },
    { name: 'Operating Systems',                 code: 'BCA302', semester: 3, credits: 4 },
    { name: 'Java Programming',                  code: 'BCA303', semester: 3, credits: 4 },
    { name: 'Computer Networks',                 code: 'BCA304', semester: 3, credits: 3 },
    { name: 'Web Technologies',                  code: 'BCA401', semester: 4, credits: 4 },
    { name: 'Software Engineering',              code: 'BCA402', semester: 4, credits: 4 },
    { name: 'Python Programming',                code: 'BCA403', semester: 4, credits: 4 },
    { name: 'Computer Graphics',                 code: 'BCA404', semester: 4, credits: 3 },
    { name: 'Artificial Intelligence',           code: 'BCA501', semester: 5, credits: 4 },
    { name: 'Mobile Application Development',    code: 'BCA502', semester: 5, credits: 4 },
    { name: 'Cloud Computing',                   code: 'BCA503', semester: 5, credits: 3, isElective: true },
    { name: 'Cyber Security',                    code: 'BCA504', semester: 5, credits: 3, isElective: true },
    { name: 'Machine Learning',                  code: 'BCA601', semester: 6, credits: 4 },
    { name: 'Project Work',                      code: 'BCA602', semester: 6, credits: 6 },
    { name: 'Entrepreneurship & Management',     code: 'BCA603', semester: 6, credits: 2 },
  ];
  const allCourses = await Course.insertMany(courseDefs.map(c => ({ ...c, department: dept._id })));
  const courseMap = {}; // code -> doc
  allCourses.forEach(c => { courseMap[c.code] = c; });
  console.log(`✓ ${allCourses.length} courses created`);

  // ── Faculty with proper subject assignment ───────────────────────────────
  // Running sems: 1, 3, 5 — assign only those subjects to faculty
  const facultyDefs = [
    {
      name: 'Herry Kargar', email: 'herry@hod.campusnex.edu',
      empId: 'BCA001', designation: 'Assistant Professor', isHOD: true,
      salary: 50000, joiningDate: '2020-07-01',
      subjects: ['BCA101', 'BCA102'], // Sem 1 — HOD teaches 2
    },
    {
      name: 'Dr. Priya Sharma', email: 'priya@faculty.campusnex.edu',
      empId: 'BCA002', designation: 'Associate Professor',
      salary: 65000, joiningDate: '2019-07-01',
      subjects: ['BCA103', 'BCA104', 'BCA301'], // Sem 1 + Sem 3
    },
    {
      name: 'Rahul Mehta', email: 'rahul@faculty.campusnex.edu',
      empId: 'BCA003', designation: 'Assistant Professor',
      salary: 45000, joiningDate: '2021-07-01',
      subjects: ['BCA302', 'BCA303', 'BCA304'], // Sem 3
    },
    {
      name: 'Sneha Patel', email: 'sneha@faculty.campusnex.edu',
      empId: 'BCA004', designation: 'Lecturer',
      salary: 38000, joiningDate: '2022-07-01',
      subjects: ['BCA501', 'BCA502'], // Sem 5
    },
    {
      name: 'Dr. Amit Joshi', email: 'amit@faculty.campusnex.edu',
      empId: 'BCA005', designation: 'Professor',
      salary: 80000, joiningDate: '2018-07-01',
      subjects: ['BCA503', 'BCA504'], // Sem 5 electives
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
    // Update course docs with faculty ref
    for (const code of f.subjects) {
      await Course.findByIdAndUpdate(courseMap[code]?._id, { faculty: faculty._id });
    }
    createdFaculty.push({ ...f, doc: faculty });
    console.log(`  ✓ Faculty: ${f.name} | Subjects: ${f.subjects.join(', ')}`);
  }

  // Assign HOD
  const hod = createdFaculty.find(f => f.isHOD);
  await Department.findByIdAndUpdate(dept._id, { hod: hod.doc._id });
  console.log('✓ HOD assigned:', hod.name);

  // ── Students ─────────────────────────────────────────────────────────────
  const sem1Students  = makeStudents(1, '2024-27', 20, 0);
  const sem3Students  = makeStudents(3, '2023-26', 20, 20);
  const sem5Students  = makeStudents(5, '2022-25', 20, 40);
  const allStudents   = [...sem1Students, ...sem3Students, ...sem5Students];

  let created = 0;
  for (const s of allStudents) {
    const existing = await User.findOne({ email: s.email });
    if (existing) continue;
    const user = await User.create({ name: s.name, email: s.email, password: 'Campus@123', role: 'student' });
    await Student.create({
      userId: user._id, enrollmentNo: s.enroll,
      department: dept._id, semester: s.sem,
      batch: s.batch, gender: s.gender,
    });
    created++;
  }
  console.log(`✓ ${created} students created (20 each in Sem 1, 3, 5)`);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('HOD:     herry@hod.campusnex.edu     / Faculty@123');
  console.log('Faculty: priya@faculty.campusnex.edu / Faculty@123');
  console.log('Student: check DB for emails          / Campus@123');
  console.log('─────────────────────────────────────────────────');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
