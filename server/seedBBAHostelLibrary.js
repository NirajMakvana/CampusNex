require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
require('./models/Student');

const Department = require('./models/Department');
const Student    = require('./models/Student');
const { HostelRoom, MaintenanceRequest } = require('./models/Hostel');
const { Book, BookIssue } = require('./models/Library');

// ── BBA Library Books ─────────────────────────────────────────────────────────
const BBA_BOOKS = [
  // Management
  { title: 'Principles of Management',              author: 'Harold Koontz',          isbn: '9780070681798', category: 'Management',       publisher: 'McGraw-Hill',      totalCopies: 6 },
  { title: 'Management: A Practical Introduction',  author: 'Angelo Kinicki',         isbn: '9781260261523', category: 'Management',       publisher: 'McGraw-Hill',      totalCopies: 5 },
  { title: 'Organisational Behaviour',              author: 'Stephen Robbins',        isbn: '9780133507645', category: 'Management',       publisher: 'Pearson',          totalCopies: 5 },
  { title: 'Human Resource Management',             author: 'Gary Dessler',           isbn: '9780134235455', category: 'Human Resources',  publisher: 'Pearson',          totalCopies: 4 },
  { title: 'Strategic Management',                  author: 'Fred David',             isbn: '9780134153971', category: 'Management',       publisher: 'Pearson',          totalCopies: 4 },
  // Finance & Accounting
  { title: 'Financial Accounting',                  author: 'R.L. Gupta & V.K. Gupta', isbn: '9788121900379', category: 'Finance',        publisher: 'Sultan Chand',     totalCopies: 6 },
  { title: 'Financial Management',                  author: 'I.M. Pandey',            isbn: '9788174466365', category: 'Finance',          publisher: 'Vikas Publishing', totalCopies: 5 },
  { title: 'Corporate Finance',                     author: 'Brealey, Myers & Allen', isbn: '9781260013900', category: 'Finance',          publisher: 'McGraw-Hill',      totalCopies: 4 },
  { title: 'Cost Accounting',                       author: 'M.N. Arora',             isbn: '9789386202178', category: 'Accounting',       publisher: 'Vikas Publishing', totalCopies: 5 },
  // Marketing
  { title: 'Marketing Management',                  author: 'Philip Kotler',          isbn: '9780133856460', category: 'Marketing',        publisher: 'Pearson',          totalCopies: 6 },
  { title: 'Consumer Behaviour',                    author: 'Leon Schiffman',         isbn: '9780134734828', category: 'Marketing',        publisher: 'Pearson',          totalCopies: 4 },
  { title: 'Digital Marketing',                     author: 'Dave Chaffey',           isbn: '9781292241579', category: 'Marketing',        publisher: 'Pearson',          totalCopies: 4 },
  // Business Law & Environment
  { title: 'Business Law',                          author: 'N.D. Kapoor',            isbn: '9788180545313', category: 'Business Law',     publisher: 'Sultan Chand',     totalCopies: 5 },
  { title: 'Business Environment',                  author: 'Francis Cherunilam',     isbn: '9788120352445', category: 'Business',         publisher: 'PHI Learning',     totalCopies: 4 },
  // Entrepreneurship
  { title: 'Entrepreneurship Development',          author: 'S.S. Khanka',            isbn: '9789351343059', category: 'Entrepreneurship', publisher: 'S. Chand',         totalCopies: 4 },
  { title: 'The Lean Startup',                      author: 'Eric Ries',              isbn: '9780307887894', category: 'Entrepreneurship', publisher: 'Crown Business',   totalCopies: 3 },
  // Statistics & Research
  { title: 'Business Statistics',                   author: 'J.K. Sharma',            isbn: '9789386202697', category: 'Statistics',       publisher: 'Vikas Publishing', totalCopies: 5 },
  { title: 'Research Methodology',                  author: 'C.R. Kothari',           isbn: '9788122424881', category: 'Research',         publisher: 'New Age Int.',     totalCopies: 4 },
  // Operations
  { title: 'Operations Management',                 author: 'William Stevenson',      isbn: '9781259667473', category: 'Operations',       publisher: 'McGraw-Hill',      totalCopies: 4 },
  // General Business
  { title: 'Good to Great',                         author: 'Jim Collins',            isbn: '9780066620992', category: 'General',          publisher: 'HarperBusiness',   totalCopies: 3 },
  { title: 'The Intelligent Investor',              author: 'Benjamin Graham',        isbn: '9780060555665', category: 'Finance',          publisher: 'HarperBusiness',   totalCopies: 3 },
  { title: 'Zero to One',                           author: 'Peter Thiel',            isbn: '9780804139021', category: 'Entrepreneurship', publisher: 'Crown Business',   totalCopies: 3 },
  { title: 'International Business',                author: 'Charles Hill',           isbn: '9781260092349', category: 'Business',         publisher: 'McGraw-Hill',      totalCopies: 4 },
  { title: 'E-Commerce: Business, Technology',      author: 'Laudon & Traver',        isbn: '9780134998459', category: 'E-Commerce',       publisher: 'Pearson',          totalCopies: 4 },
  { title: 'Business Ethics',                       author: 'Manuel Velasquez',       isbn: '9780205017669', category: 'Ethics',           publisher: 'Pearson',          totalCopies: 3 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected:', process.env.MONGO_URI);

  // ── Fetch BBA students ────────────────────────────────────────────────────
  const dept = await Department.findOne({ code: 'BBA' });
  if (!dept) { console.error('BBA department not found. Run seedBBA.js first.'); process.exit(1); }

  const bbaStudents = await Student.find({ department: dept._id }).populate('userId', 'name gender');
  const males   = bbaStudents.filter(s => s.gender === 'male');
  const females = bbaStudents.filter(s => s.gender === 'female');
  console.log(`✓ Found ${bbaStudents.length} BBA students (${males.length}M / ${females.length}F)`);

  // ── Hostel — Block C (Boys) + Block D (Girls) ─────────────────────────────
  // Remove any existing BBA hostel rooms
  await HostelRoom.deleteMany({ roomNo: { $regex: /^[CD]/ } });
  console.log('✓ Cleared old Block C/D rooms');

  const roomDefs = [];
  // Block C — BBA Boys (Floor 1-2, 7 rooms each = 14 rooms)
  for (let floor = 1; floor <= 2; floor++) {
    for (let r = 1; r <= 5; r++) {
      roomDefs.push({ roomNo: `C${floor}0${r}`, floor, type: 'double', capacity: 2, monthlyFee: 3500, block: 'C' });
    }
    for (let r = 6; r <= 7; r++) {
      roomDefs.push({ roomNo: `C${floor}0${r}`, floor, type: 'triple', capacity: 3, monthlyFee: 2800, block: 'C' });
    }
  }
  // Block D — BBA Girls (Floor 1-2, 6 rooms each = 12 rooms)
  for (let floor = 1; floor <= 2; floor++) {
    for (let r = 1; r <= 4; r++) {
      roomDefs.push({ roomNo: `D${floor}0${r}`, floor, type: 'double', capacity: 2, monthlyFee: 3500, block: 'D' });
    }
    for (let r = 5; r <= 6; r++) {
      roomDefs.push({ roomNo: `D${floor}0${r}`, floor, type: 'triple', capacity: 3, monthlyFee: 2800, block: 'D' });
    }
  }

  let maleIdx = 0, femaleIdx = 0;
  const createdRooms = [];

  for (const def of roomDefs) {
    const isBoys = def.block === 'C';
    const pool   = isBoys ? males : females;
    const idx    = isBoys ? maleIdx : femaleIdx;
    const fillCount = Math.random() > 0.2 ? def.capacity : def.capacity - 1;
    const occupants = [];
    for (let i = 0; i < fillCount; i++) {
      if (pool[idx + i]) occupants.push(pool[idx + i]._id);
    }
    if (isBoys) maleIdx   += fillCount;
    else        femaleIdx += fillCount;

    const room = await HostelRoom.create({
      roomNo: def.roomNo, floor: def.floor, type: def.type,
      capacity: def.capacity, monthlyFee: def.monthlyFee,
      occupants, isAvailable: occupants.length < def.capacity,
    });
    createdRooms.push(room);
  }
  console.log(`✓ ${createdRooms.length} BBA hostel rooms created (Block C: Boys, Block D: Girls)`);

  // Update student hostelId
  for (const room of createdRooms) {
    for (const occId of room.occupants) {
      await Student.findByIdAndUpdate(occId, { hostelId: room._id });
    }
  }
  console.log('✓ Student hostelId updated');

  // Maintenance requests for BBA hostel
  const maintenanceIssues = [
    'Ceiling fan making noise', 'Bathroom tap leaking', 'Window glass cracked',
    'Power socket not working', 'Door lock broken', 'Washroom drain blocked',
  ];
  const statuses = ['pending', 'pending', 'in-progress', 'resolved'];
  const maintenanceData = [];
  for (let i = 0; i < 8; i++) {
    const room   = createdRooms[Math.floor(Math.random() * createdRooms.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const student = bbaStudents[Math.floor(Math.random() * bbaStudents.length)];
    maintenanceData.push({
      room: room._id, requestedBy: student._id,
      issue: maintenanceIssues[i % maintenanceIssues.length],
      status, resolvedAt: status === 'resolved' ? new Date() : undefined,
    });
  }
  const { MaintenanceRequest: MR } = require('./models/Hostel');
  await MR.insertMany(maintenanceData);
  console.log(`✓ ${maintenanceData.length} BBA maintenance requests created`);

  // ── Library — Add BBA Books ───────────────────────────────────────────────
  // Don't delete existing books — just add BBA ones (skip if ISBN already exists)
  let booksAdded = 0;
  const addedBooks = [];
  for (const b of BBA_BOOKS) {
    const exists = await Book.findOne({ isbn: b.isbn });
    if (exists) { addedBooks.push(exists); continue; }
    const book = await Book.create({ ...b, availableCopies: b.totalCopies });
    addedBooks.push(book);
    booksAdded++;
  }
  console.log(`✓ ${booksAdded} new BBA books added to library (${BBA_BOOKS.length - booksAdded} already existed)`);

  // Issue some BBA books to BBA students
  const now = new Date();
  const issueRecords = [];
  const shuffled = [...addedBooks].sort(() => Math.random() - 0.5).slice(0, 18);

  for (let idx = 0; idx < shuffled.length; idx++) {
    const book    = shuffled[idx];
    const student = bbaStudents[idx % bbaStudents.length];
    const issueDate = new Date(now.getTime() - Math.random() * 20 * 86400000);
    const dueDate   = new Date(issueDate.getTime() + 14 * 86400000);

    let status = 'issued', returnDate = null, fine = 0;
    if (idx % 6 === 0) {
      status = 'returned';
      returnDate = new Date(dueDate.getTime() - 2 * 86400000);
    } else if (dueDate < now) {
      status = 'overdue';
      fine = Math.floor((now - dueDate) / 86400000) * 5;
    }

    issueRecords.push({ book: book._id, student: student._id, issueDate, dueDate, returnDate, status, fine });
    if (status !== 'returned') {
      await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });
    }
  }

  await BookIssue.insertMany(issueRecords);
  const issued   = issueRecords.filter(i => i.status === 'issued').length;
  const returned = issueRecords.filter(i => i.status === 'returned').length;
  const overdue  = issueRecords.filter(i => i.status === 'overdue').length;
  console.log(`✓ ${issueRecords.length} BBA book issues — Issued:${issued} Returned:${returned} Overdue:${overdue}`);

  console.log('\n✅ BBA Hostel + Library seed complete!');
  console.log(`   Hostel: ${createdRooms.length} rooms | Block C (Boys) + Block D (Girls)`);
  console.log(`   Library: ${booksAdded} new books | ${issueRecords.length} issue records`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
