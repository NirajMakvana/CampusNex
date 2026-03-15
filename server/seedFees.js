require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
const Department = require('./models/Department');
const Student    = require('./models/Student');
const { Fee, FeeStructure } = require('./models/Fee');

const ACADEMIC_YEAR = '2024-25';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected');

  const dept = await Department.findOne({ code: 'BCA' });
  if (!dept) { console.error('BCA dept not found'); process.exit(1); }

  // Clear existing
  await FeeStructure.deleteMany({ academicYear: ACADEMIC_YEAR });
  await Fee.deleteMany({});
  console.log('✓ Cleared old fee data');

  // ── Fee Structures (per semester) ────────────────────────────────────────
  const structures = await FeeStructure.insertMany([
    { department: dept._id, semester: 1, amount: 45000, academicYear: ACADEMIC_YEAR, description: 'BCA Sem 1 Tuition Fee' },
    { department: dept._id, semester: 3, amount: 45000, academicYear: ACADEMIC_YEAR, description: 'BCA Sem 3 Tuition Fee' },
    { department: dept._id, semester: 5, amount: 48000, academicYear: ACADEMIC_YEAR, description: 'BCA Sem 5 Tuition Fee' },
  ]);
  console.log(`✓ ${structures.length} fee structures created`);

  // Map sem -> structure
  const structMap = {};
  structures.forEach(s => { structMap[s.semester] = s; });

  // ── Assign fees to all students ──────────────────────────────────────────
  const students = await Student.find({ semester: { $in: [1, 3, 5] } });

  const feeRecords = [];
  const now = new Date();

  students.forEach((s, idx) => {
    const struct = structMap[s.semester];
    if (!struct) return;

    // Due date: March 31 2026
    const dueDate = new Date('2026-03-31');

    // Realistic mix: 60% paid, 25% pending, 15% overdue
    let status, paidDate, transactionId, discount;
    const r = Math.random();

    if (r < 0.60) {
      status = 'paid';
      paidDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000); // paid within last 60 days
      transactionId = `TXN${Date.now()}${idx}`;
      discount = idx % 10 === 0 ? 2000 : 0; // every 10th student gets scholarship discount
    } else if (r < 0.85) {
      status = 'pending';
      paidDate = null;
      transactionId = null;
      discount = 0;
    } else {
      status = 'overdue';
      paidDate = null;
      transactionId = null;
      discount = 0;
    }

    feeRecords.push({
      student: s._id,
      feeStructure: struct._id,
      amount: struct.amount,
      discount: discount || 0,
      dueDate,
      paidDate,
      status,
      transactionId,
      paymentMethod: status === 'paid' ? (idx % 3 === 0 ? 'online' : idx % 3 === 1 ? 'cash' : 'cheque') : null,
    });
  });

  await Fee.insertMany(feeRecords);

  const paid    = feeRecords.filter(f => f.status === 'paid').length;
  const pending = feeRecords.filter(f => f.status === 'pending').length;
  const overdue = feeRecords.filter(f => f.status === 'overdue').length;
  const totalAmt = feeRecords.reduce((s, f) => s + f.amount - f.discount, 0);
  const collectedAmt = feeRecords.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount - f.discount, 0);

  console.log(`\n✅ ${feeRecords.length} fee records created`);
  console.log(`   Paid: ${paid} | Pending: ${pending} | Overdue: ${overdue}`);
  console.log(`   Total: ₹${totalAmt.toLocaleString('en-IN')} | Collected: ₹${collectedAmt.toLocaleString('en-IN')}`);
  process.exit(0);
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
