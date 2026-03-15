require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Faculty');

const Faculty      = require('./models/Faculty');
const LeaveRequest = require('./models/LeaveRequest');

// Realistic leave reasons per type
const REASONS = {
  casual: [
    'Personal work at home town',
    'Attending family function',
    'Child school admission process',
    'Bank and government office work',
    'Relative visiting from out of town',
  ],
  sick: [
    'Suffering from viral fever and doctor advised rest',
    'Severe migraine, unable to attend college',
    'Food poisoning, doctor prescribed 2 days rest',
    'Throat infection and high temperature',
    'Back pain, physiotherapy sessions scheduled',
  ],
  earned: [
    'Annual family vacation',
    'Attending elder sibling\'s wedding ceremony',
    'Pilgrimage trip planned with family',
    'Medical treatment for chronic condition',
    'Home renovation work requiring personal supervision',
  ],
  other: [
    'Attending national level seminar as speaker',
    'PhD thesis submission and viva preparation',
    'Attending workshop on research methodology',
    'Guest lecture at another institution',
    'Participating in faculty development programme',
  ],
};

const REMARKS = {
  approved: [
    'Approved. Please ensure class arrangements.',
    'Approved. Kindly submit leave application form.',
    'Approved. Ensure your classes are covered.',
    'Approved as requested.',
  ],
  rejected: [
    'Rejected. Exam duty scheduled on these dates.',
    'Rejected. Insufficient leave balance.',
    'Rejected. Critical lab sessions cannot be missed.',
    'Rejected. Prior approval not taken in time.',
  ],
};

function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function dateOffset(base, daysOffset, durationDays = 1) {
  const from = new Date(base);
  from.setDate(from.getDate() + daysOffset);
  const to = new Date(from);
  to.setDate(to.getDate() + durationDays - 1);
  return { fromDate: from, toDate: to };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  await LeaveRequest.deleteMany({});
  console.log('✓ Cleared old leave requests');

  const allFaculty = await Faculty.find({});
  if (allFaculty.length === 0) { console.error('No faculty found. Run seedData.js first.'); process.exit(1); }
  console.log(`✓ Found ${allFaculty.length} faculty members`);

  const base = new Date('2026-03-15'); // today reference
  const leaves = [];

  // Each faculty gets 2-4 leave requests with realistic spread
  const leaveTemplates = [
    // Past — approved
    { offsetDays: -45, duration: 2, type: 'sick',   status: 'approved' },
    { offsetDays: -30, duration: 1, type: 'casual', status: 'approved' },
    { offsetDays: -20, duration: 3, type: 'earned', status: 'approved' },
    { offsetDays: -15, duration: 1, type: 'casual', status: 'rejected' },
    { offsetDays: -10, duration: 2, type: 'sick',   status: 'approved' },
    { offsetDays: -7,  duration: 1, type: 'other',  status: 'approved' },
    // Recent — pending or decided
    { offsetDays: -5,  duration: 1, type: 'casual', status: 'pending'  },
    { offsetDays: -3,  duration: 2, type: 'sick',   status: 'pending'  },
    { offsetDays: -2,  duration: 1, type: 'casual', status: 'rejected' },
    // Upcoming — pending
    { offsetDays: 3,   duration: 2, type: 'casual', status: 'pending'  },
    { offsetDays: 7,   duration: 3, type: 'earned', status: 'pending'  },
    { offsetDays: 10,  duration: 1, type: 'other',  status: 'pending'  },
    { offsetDays: 15,  duration: 5, type: 'earned', status: 'pending'  },
    { offsetDays: 20,  duration: 2, type: 'sick',   status: 'pending'  },
  ];

  for (const faculty of allFaculty) {
    // Pick 3-4 templates per faculty (randomised subset)
    const count = 3 + Math.floor(Math.random() * 2); // 3 or 4
    const shuffled = [...leaveTemplates].sort(() => Math.random() - 0.5).slice(0, count);

    for (const tmpl of shuffled) {
      const { fromDate, toDate } = dateOffset(base, tmpl.offsetDays, tmpl.duration);
      const reasons = REASONS[tmpl.type];
      const adminRemark = tmpl.status === 'approved'
        ? randFrom(REMARKS.approved)
        : tmpl.status === 'rejected'
          ? randFrom(REMARKS.rejected)
          : undefined;

      leaves.push({
        faculty: faculty._id,
        type: tmpl.type,
        fromDate,
        toDate,
        reason: randFrom(reasons),
        status: tmpl.status,
        adminRemark,
      });
    }
  }

  await LeaveRequest.insertMany(leaves);

  const pending  = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;

  console.log(`\n✅ Leave seed complete! ${leaves.length} requests created`);
  console.log(`   Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}`);
  console.log(`   Faculty covered: ${allFaculty.length} (BCA + BBA)`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
