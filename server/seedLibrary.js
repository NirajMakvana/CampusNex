require('dotenv').config();
const mongoose = require('mongoose');

require('./models/User');
require('./models/Department');
const Student = require('./models/Student');
const { Book, BookIssue } = require('./models/Library');

// BCA-relevant books across categories
const BOOKS = [
  // Programming
  { title: 'The C Programming Language',           author: 'Kernighan & Ritchie',   isbn: '9780131103627', category: 'Programming',        publisher: 'Prentice Hall',    totalCopies: 5 },
  { title: 'Object-Oriented Programming in C++',   author: 'Robert Lafore',         isbn: '9780672323089', category: 'Programming',        publisher: 'Sams Publishing',  totalCopies: 4 },
  { title: 'Java: The Complete Reference',          author: 'Herbert Schildt',       isbn: '9781260440232', category: 'Programming',        publisher: 'McGraw-Hill',      totalCopies: 6 },
  { title: 'Python Crash Course',                  author: 'Eric Matthes',          isbn: '9781593279288', category: 'Programming',        publisher: 'No Starch Press',  totalCopies: 5 },
  { title: 'Clean Code',                           author: 'Robert C. Martin',      isbn: '9780132350884', category: 'Programming',        publisher: 'Prentice Hall',    totalCopies: 3 },
  // Data Structures
  { title: 'Data Structures and Algorithms in Java', author: 'Robert Lafore',       isbn: '9780672324536', category: 'Data Structures',    publisher: 'Sams Publishing',  totalCopies: 5 },
  { title: 'Introduction to Algorithms',           author: 'Cormen et al.',         isbn: '9780262033848', category: 'Data Structures',    publisher: 'MIT Press',        totalCopies: 4 },
  { title: 'Data Structures Using C',              author: 'Reema Thareja',         isbn: '9780198099307', category: 'Data Structures',    publisher: 'Oxford Press',     totalCopies: 6 },
  // Database
  { title: 'Database System Concepts',             author: 'Silberschatz et al.',   isbn: '9780078022159', category: 'Database',           publisher: 'McGraw-Hill',      totalCopies: 5 },
  { title: 'Learning SQL',                         author: 'Alan Beaulieu',         isbn: '9781492057611', category: 'Database',           publisher: "O'Reilly",         totalCopies: 4 },
  // Networking
  { title: 'Computer Networks',                    author: 'Andrew Tanenbaum',      isbn: '9780132126953', category: 'Networking',         publisher: 'Prentice Hall',    totalCopies: 5 },
  { title: 'Data Communications and Networking',   author: 'Behrouz Forouzan',      isbn: '9780073376226', category: 'Networking',         publisher: 'McGraw-Hill',      totalCopies: 4 },
  // OS
  { title: 'Operating System Concepts',            author: 'Silberschatz et al.',   isbn: '9781119800361', category: 'Operating Systems',  publisher: 'Wiley',            totalCopies: 5 },
  { title: 'Modern Operating Systems',             author: 'Andrew Tanenbaum',      isbn: '9780133591620', category: 'Operating Systems',  publisher: 'Prentice Hall',    totalCopies: 3 },
  // Web
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett',        isbn: '9781118008188', category: 'Web Development',    publisher: 'Wiley',            totalCopies: 6 },
  { title: 'JavaScript: The Good Parts',           author: 'Douglas Crockford',     isbn: '9780596517748', category: 'Web Development',    publisher: "O'Reilly",         totalCopies: 4 },
  { title: 'Learning React',                       author: 'Alex Banks',            isbn: '9781492051725', category: 'Web Development',    publisher: "O'Reilly",         totalCopies: 3 },
  // AI/ML
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', isbn: '9780134610993', category: 'AI & ML',          publisher: 'Prentice Hall',    totalCopies: 4 },
  { title: 'Hands-On Machine Learning',            author: 'Aurélien Géron',        isbn: '9781492032649', category: 'AI & ML',            publisher: "O'Reilly",         totalCopies: 3 },
  // Mathematics
  { title: 'Discrete Mathematics',                 author: 'Kenneth Rosen',         isbn: '9780073383095', category: 'Mathematics',        publisher: 'McGraw-Hill',      totalCopies: 5 },
  { title: 'Engineering Mathematics',              author: 'B.S. Grewal',           isbn: '9788174091955', category: 'Mathematics',        publisher: 'Khanna Publishers', totalCopies: 6 },
  // Software Engineering
  { title: 'Software Engineering',                 author: 'Ian Sommerville',       isbn: '9780133943030', category: 'Software Engineering', publisher: 'Pearson',        totalCopies: 4 },
  { title: 'The Pragmatic Programmer',             author: 'Hunt & Thomas',         isbn: '9780135957059', category: 'Software Engineering', publisher: 'Addison-Wesley', totalCopies: 3 },
  // General
  { title: 'The Mythical Man-Month',               author: 'Frederick Brooks',      isbn: '9780201835953', category: 'General',            publisher: 'Addison-Wesley',   totalCopies: 2 },
  { title: 'Computer Organization and Architecture', author: 'William Stallings',   isbn: '9780134101613', category: 'Computer Architecture', publisher: 'Pearson',       totalCopies: 4 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected');

  await Book.deleteMany({});
  await BookIssue.deleteMany({});
  console.log('✓ Cleared old library data');

  // Create books with availableCopies = totalCopies initially
  const books = await Book.insertMany(
    BOOKS.map(b => ({ ...b, availableCopies: b.totalCopies }))
  );
  console.log(`✓ ${books.length} books added`);

  // Issue some books to random students
  const students = await Student.find({});
  if (students.length === 0) { console.log('No students found, skipping issues'); process.exit(0); }

  const now = new Date();
  const issues = [];

  // Issue ~15 books to random students
  const shuffledBooks = [...books].sort(() => Math.random() - 0.5).slice(0, 15);
  shuffledBooks.forEach((book, idx) => {
    const student = students[idx % students.length];
    const issueDate = new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    let status = 'issued';
    let returnDate = null;
    let fine = 0;

    if (idx % 5 === 0) {
      // returned
      status = 'returned';
      returnDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    } else if (dueDate < now) {
      // overdue
      status = 'overdue';
      const daysLate = Math.floor((now - dueDate) / (24 * 60 * 60 * 1000));
      fine = daysLate * 5; // ₹5/day
    }

    issues.push({ book: book._id, student: student._id, issueDate, dueDate, returnDate, status, fine });

    // Reduce available copies for non-returned
    if (status !== 'returned') {
      Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } }).exec();
    }
  });

  await BookIssue.insertMany(issues);

  const issued   = issues.filter(i => i.status === 'issued').length;
  const returned = issues.filter(i => i.status === 'returned').length;
  const overdue  = issues.filter(i => i.status === 'overdue').length;

  console.log(`✓ ${issues.length} book issues created — Issued:${issued} Returned:${returned} Overdue:${overdue}`);
  console.log('\n✅ Library seed complete!');
  console.log(`   Total books: ${books.length} titles`);
  console.log(`   Total copies: ${books.reduce((s, b) => s + b.totalCopies, 0)}`);
  process.exit(0);
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
