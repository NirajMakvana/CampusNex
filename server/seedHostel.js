require('dotenv').config();
const mongoose = require('mongoose');

require('./models/Student');
require('./models/User');

const { HostelRoom, MaintenanceRequest, MessMenu } = require('./models/Hostel');
const Student = require('./models/Student');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  // ── Clean ────────────────────────────────────────────────────────────────
  await HostelRoom.deleteMany({});
  await MaintenanceRequest.deleteMany({});
  await MessMenu.deleteMany({});
  console.log('✓ Cleared old hostel data');

  // ── Fetch students ───────────────────────────────────────────────────────
  const students = await Student.find({}).populate('userId', 'name gender');
  const males   = students.filter(s => s.gender === 'male');
  const females = students.filter(s => s.gender === 'female');
  console.log(`✓ Found ${males.length} male, ${females.length} female students`);

  // ── Room definitions ─────────────────────────────────────────────────────
  // Boys Hostel: Block A (Floor 1-2), 10 double rooms + 4 triple rooms
  // Girls Hostel: Block B (Floor 1-2), 8 double rooms + 4 triple rooms
  const roomDefs = [];

  // Block A — Boys (14 rooms, capacity ~32)
  for (let floor = 1; floor <= 2; floor++) {
    for (let r = 1; r <= 5; r++) {
      roomDefs.push({ roomNo: `A${floor}0${r}`, floor, type: 'double', capacity: 2, monthlyFee: 3500, block: 'A' });
    }
    for (let r = 6; r <= 7; r++) {
      roomDefs.push({ roomNo: `A${floor}0${r}`, floor, type: 'triple', capacity: 3, monthlyFee: 2800, block: 'A' });
    }
  }

  // Block B — Girls (12 rooms, capacity ~28)
  for (let floor = 1; floor <= 2; floor++) {
    for (let r = 1; r <= 4; r++) {
      roomDefs.push({ roomNo: `B${floor}0${r}`, floor, type: 'double', capacity: 2, monthlyFee: 3500, block: 'B' });
    }
    for (let r = 5; r <= 6; r++) {
      roomDefs.push({ roomNo: `B${floor}0${r}`, floor, type: 'triple', capacity: 3, monthlyFee: 2800, block: 'B' });
    }
  }

  // ── Create rooms & assign occupants ─────────────────────────────────────
  let maleIdx = 0, femaleIdx = 0;
  const createdRooms = [];

  for (const def of roomDefs) {
    const isBoys = def.block === 'A';
    const pool   = isBoys ? males : females;
    const idx    = isBoys ? maleIdx : femaleIdx;

    // Fill room up to capacity (leave ~20% rooms partially empty for realism)
    const fillCount = Math.random() > 0.2 ? def.capacity : def.capacity - 1;
    const occupants = [];
    for (let i = 0; i < fillCount; i++) {
      const student = pool[idx + i];
      if (student) occupants.push(student._id);
    }

    if (isBoys) maleIdx   += fillCount;
    else        femaleIdx += fillCount;

    const room = await HostelRoom.create({
      roomNo:     def.roomNo,
      floor:      def.floor,
      type:       def.type,
      capacity:   def.capacity,
      monthlyFee: def.monthlyFee,
      occupants,
      isAvailable: occupants.length < def.capacity,
    });
    createdRooms.push(room);
  }
  console.log(`✓ ${createdRooms.length} rooms created`);

  // ── Maintenance Requests ─────────────────────────────────────────────────
  const issues = [
    'Leaking tap in bathroom',
    'Ceiling fan not working',
    'Window latch broken',
    'Light bulb fused',
    'Door lock jammed',
    'Water heater not heating',
    'Mosquito net torn',
    'Wardrobe door hinge broken',
    'Washroom drain blocked',
    'Power socket not working',
  ];
  const statuses = ['pending', 'pending', 'in-progress', 'resolved'];

  const maintenanceData = [];
  for (let i = 0; i < 12; i++) {
    const room    = createdRooms[Math.floor(Math.random() * createdRooms.length)];
    const status  = statuses[Math.floor(Math.random() * statuses.length)];
    const student = students[Math.floor(Math.random() * students.length)];
    maintenanceData.push({
      room:        room._id,
      requestedBy: student._id,
      issue:       issues[i % issues.length],
      status,
      resolvedAt:  status === 'resolved' ? new Date() : undefined,
    });
  }
  await MaintenanceRequest.insertMany(maintenanceData);
  console.log(`✓ ${maintenanceData.length} maintenance requests created`);

  // ── Mess Menu (current week) ─────────────────────────────────────────────
  await MessMenu.create({
    weekLabel: 'Week of 16 Mar 2026',
    isActive: true,
    menu: {
      Monday:    { breakfast: 'Poha + Chai',          lunch: 'Dal Tadka + Rice + Roti',       dinner: 'Paneer Butter Masala + Roti + Rice' },
      Tuesday:   { breakfast: 'Upma + Juice',          lunch: 'Rajma + Rice + Salad',          dinner: 'Aloo Matar + Roti + Dal' },
      Wednesday: { breakfast: 'Idli Sambar + Chai',    lunch: 'Chole + Rice + Roti',           dinner: 'Mix Veg + Roti + Rice + Raita' },
      Thursday:  { breakfast: 'Paratha + Curd',        lunch: 'Dal Fry + Rice + Roti',         dinner: 'Kadhi Pakora + Rice + Roti' },
      Friday:    { breakfast: 'Bread Butter + Chai',   lunch: 'Palak Paneer + Rice + Roti',    dinner: 'Chana Masala + Roti + Rice' },
      Saturday:  { breakfast: 'Poha + Banana',         lunch: 'Special Biryani + Raita',       dinner: 'Dal Makhani + Roti + Rice + Salad' },
      Sunday:    { breakfast: 'Puri Bhaji + Chai',     lunch: 'Shahi Paneer + Rice + Roti',    dinner: 'Aloo Gobi + Roti + Dal + Sweet' },
    },
  });
  console.log('✓ Mess menu created (Week of 16 Mar 2026)');

  console.log('\n✅ Hostel seed complete!');
  console.log(`   Rooms: ${createdRooms.length} | Boys: Block A | Girls: Block B`);
  console.log(`   Maintenance: 12 requests | Mess: 1 week menu`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
