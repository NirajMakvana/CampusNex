require('dotenv').config();
const mongoose = require('mongoose');
const Notice = require('./models/Notice');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  await Notice.deleteMany({});
  console.log('✓ Cleared old notices');

  // Get admin/superadmin user to use as postedBy
  const admin = await User.findOne({ role: { $in: ['superadmin', 'admin'] } });
  if (!admin) { console.error('No admin user found. Run createSuperAdmin.js first.'); process.exit(1); }

  const hod = await User.findOne({ email: 'herry@hod.campusnex.edu' });
  const poster      = admin._id;
  const hodPoster   = hod?._id || admin._id;

  const now = new Date('2026-03-15');

  const notices = [
    // ── PINNED / IMPORTANT ──────────────────────────────────────────────────
    {
      title: 'End Semester Examination Schedule — April 2026',
      message: `The End Semester Examinations for BCA Semester 1, 3, and 5 will commence from 7th April 2026. 
Detailed timetable has been uploaded on the notice board. Students are advised to carry their Hall Tickets and College ID. 
No student will be allowed inside the examination hall 15 minutes after the exam begins. 
Use of mobile phones is strictly prohibited inside the examination hall.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: true,
      eventDate: new Date('2026-04-07'),
      expiresAt: new Date('2026-04-30'),
    },
    {
      title: 'Fee Payment Deadline — Last Date: 31st March 2026',
      message: `All students who have pending semester fees are requested to clear their dues on or before 31st March 2026. 
Students with outstanding fees will not be permitted to appear in the End Semester Examinations. 
Late payment will attract a fine of ₹50 per day after the due date. 
Contact the accounts office (Room 102, Admin Block) for any queries.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: true,
      eventDate: new Date('2026-03-31'),
      expiresAt: new Date('2026-03-31'),
    },

    // ── EXAM RELATED ────────────────────────────────────────────────────────
    {
      title: 'Practical Examination Guidelines — April 2026',
      message: `Practical examinations for BCA Sem 1 (Programming in C Lab), Sem 3 (DBMS Lab & Java Lab), and Sem 5 (Mobile App Dev Lab) are scheduled in the last week of April 2026. 
Students must bring their practical journals duly signed by the concerned faculty. 
Incomplete journals will result in disqualification from the practical exam. 
Report to the respective labs 30 minutes before the scheduled time.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-04-21'),
    },
    {
      title: 'Hall Ticket Distribution — Exam 2026',
      message: `Hall tickets for the April 2026 End Semester Examinations will be distributed from 1st April 2026 onwards. 
Students can collect their hall tickets from the examination office between 10:00 AM – 4:00 PM on working days. 
Students with fee dues or library pending returns will not receive hall tickets until clearance. 
Carry your college ID card at the time of collection.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-04-01'),
    },
    {
      title: 'Internal Assessment Marks Submission Deadline',
      message: `All faculty members are requested to submit the Internal Assessment marks for Semester 1, 3, and 5 students by 25th March 2026. 
Marks should be submitted through the CampusNex portal under the Exams section. 
Any discrepancy in marks must be reported to the examination committee before submission. 
Marks submitted after the deadline will not be accepted.`,
      targetRole: 'faculty',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-03-25'),
      expiresAt: new Date('2026-03-25'),
    },

    // ── HOSTEL ──────────────────────────────────────────────────────────────
    {
      title: 'Hostel Vacation Notice — Summer Break 2026',
      message: `All hostel residents are informed that the hostel will remain closed from 1st May 2026 to 15th June 2026 for summer vacation. 
Students must vacate their rooms by 30th April 2026. 
Valuables should not be left in the rooms during vacation. 
Students requiring hostel accommodation during vacation must apply to the warden office by 20th April 2026.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-04-30'),
    },
    {
      title: 'Hostel Mess Menu Update — March 2026',
      message: `The hostel mess menu has been updated for the month of March 2026. 
Special Sunday meals will include one sweet dish every week. 
Students with dietary restrictions or allergies are requested to inform the mess supervisor. 
Feedback forms are available at the mess counter — your suggestions are welcome.`,
      targetRole: 'student',
      postedBy: hodPoster,
      isPinned: false,
    },

    // ── GENERAL / ALL ───────────────────────────────────────────────────────
    {
      title: 'Annual Sports Day — 22nd March 2026',
      message: `The Annual Sports Day will be held on 22nd March 2026 at the college ground. 
Events include 100m sprint, long jump, shot put, tug of war, and cricket. 
All students and faculty are encouraged to participate. 
Registration forms are available at the sports office. Last date to register: 18th March 2026.`,
      targetRole: 'all',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-03-22'),
    },
    {
      title: 'College Closed — Holi Holiday (25th March 2026)',
      message: `The college will remain closed on 25th March 2026 on account of Holi. 
All classes, labs, and office work are suspended for the day. 
The hostel mess will serve special Holi lunch. 
Regular classes will resume from 26th March 2026.`,
      targetRole: 'all',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-03-25'),
    },
    {
      title: 'Library Book Return Reminder',
      message: `All students who have borrowed books from the college library are reminded to return them before 28th March 2026. 
Students with unreturned books will not be issued hall tickets for the upcoming examinations. 
A fine of ₹5 per day per book will be charged for overdue returns. 
The library will remain open from 9:00 AM to 5:00 PM on all working days.`,
      targetRole: 'student',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-03-28'),
      expiresAt: new Date('2026-03-28'),
    },

    // ── FACULTY ─────────────────────────────────────────────────────────────
    {
      title: 'Faculty Meeting — 20th March 2026',
      message: `A faculty meeting is scheduled on 20th March 2026 at 2:00 PM in the Conference Hall (Room 201, Admin Block). 
Agenda: Review of semester progress, exam duty assignments, and upcoming accreditation visit preparation. 
Attendance is mandatory for all teaching staff. 
Please bring your course completion status report.`,
      targetRole: 'faculty',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-03-20'),
    },
    {
      title: 'Exam Duty Roster — April 2026',
      message: `The exam duty roster for the April 2026 End Semester Examinations has been prepared. 
Faculty members are requested to check their assigned duties on the notice board outside the examination office. 
Any request for duty swap must be submitted in writing to the examination committee by 2nd April 2026. 
Absence from exam duty without prior approval will be treated as a serious disciplinary matter.`,
      targetRole: 'faculty',
      postedBy: poster,
      isPinned: false,
      eventDate: new Date('2026-04-07'),
    },

    // ── HOD NOTICE ──────────────────────────────────────────────────────────
    {
      title: 'BCA Department — Syllabus Completion Deadline',
      message: `All BCA faculty members are requested to ensure 100% syllabus completion for Semester 1, 3, and 5 by 30th March 2026. 
Any pending topics must be covered through extra classes if required. 
Please update the course completion status on the CampusNex portal. 
Students requiring doubt-clearing sessions may contact their respective faculty during office hours.`,
      targetRole: 'faculty',
      postedBy: hodPoster,
      isPinned: false,
      eventDate: new Date('2026-03-30'),
    },
  ];

  // Adjust createdAt to spread notices over past 2 weeks for realism
  const inserted = [];
  for (let i = 0; i < notices.length; i++) {
    const daysAgo = Math.floor(i * 1.2);
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const doc = await Notice.create({ ...notices[i], createdAt, updatedAt: createdAt });
    inserted.push(doc);
    console.log(`  ✓ [${notices[i].targetRole.padEnd(7)}] ${notices[i].title.substring(0, 60)}`);
  }

  console.log(`\n✅ Notice seed complete! ${inserted.length} notices created.`);
  console.log('   Pinned: 2 | Exam: 4 | Hostel: 2 | General: 3 | Faculty: 3 | HOD: 1');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
