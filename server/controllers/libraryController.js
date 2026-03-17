const asyncHandler = require('express-async-handler');
const { Book, BookIssue, BookReservation } = require('../models/Library');

const getBooks = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const filter = search
    ? { $or: [{ title: new RegExp(search, 'i') }, { author: new RegExp(search, 'i') }, { isbn: search }] }
    : {};

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(200, parseInt(limit) || 100);
  const skip = (pageNum - 1) * limitNum;

  const total = await Book.countDocuments(filter);
  const books = await Book.find(filter).sort({ title: 1 }).skip(skip).limit(limitNum);
  res.json({ success: true, count: total, page: pageNum, pages: Math.ceil(total / limitNum), data: books });
});

const addBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
});

const issueBook = asyncHandler(async (req, res) => {
  const { bookId, studentId, dueDate } = req.body;
  const book = await Book.findById(bookId);
  if (!book || book.availableCopies < 1) {
    res.status(400); throw new Error('Book not available');
  }
  book.availableCopies--;
  await book.save();
  const issue = await BookIssue.create({ book: bookId, student: studentId, dueDate });
  res.status(201).json({ success: true, data: issue });
});

const returnBook = asyncHandler(async (req, res) => {
  const issue = await BookIssue.findById(req.params.id);
  if (!issue) { res.status(404); throw new Error('Issue record not found'); }

  const today = new Date();
  const due = new Date(issue.dueDate);
  const overdueDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
  const fine = overdueDays * 5; // ₹5 per day

  issue.returnDate = today;
  issue.fine = fine;
  issue.status = 'returned';
  await issue.save();

  await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });
  res.json({ success: true, fine, data: issue });
});

const reserveBook = asyncHandler(async (req, res) => {
  const { bookId, studentId } = req.body;
  const book = await Book.findById(bookId);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  if (book.availableCopies > 0) { res.status(400); throw new Error('Book is available — issue it directly'); }
  const existing = await BookReservation.findOne({ book: bookId, student: studentId, status: 'pending' });
  if (existing) { res.status(400); throw new Error('Already reserved'); }
  const reservation = await BookReservation.create({ book: bookId, student: studentId });
  res.status(201).json({ success: true, data: reservation });
});

const getReservations = asyncHandler(async (req, res) => {
  const reservations = await BookReservation.find({ status: 'pending' })
    .populate('book', 'title author')
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reservations });
});

const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await BookReservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!reservation) { res.status(404); throw new Error('Reservation not found'); }
  res.json({ success: true, data: reservation });
});

const getLibraryStats = asyncHandler(async (req, res) => {
  // Auto-mark overdue issues
  await BookIssue.updateMany(
    { status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  const [totalBooks, totalIssued, totalOverdue, totalReservations, recentIssues, categoryAgg] = await Promise.all([
    Book.aggregate([{ $group: { _id: null, totalBooks: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }]),
    BookIssue.countDocuments({ status: 'issued' }),
    BookIssue.countDocuments({ status: 'overdue' }),
    BookReservation.countDocuments({ status: 'pending' }),
    BookIssue.find({ status: { $ne: 'returned' } })
      .populate('book', 'title author')
      .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
      .sort({ issueDate: -1 }).limit(5),
    Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 6 }
    ]),
  ]);

  const bookStats = totalBooks[0] || { totalBooks: 0, available: 0 };

  res.json({
    success: true,
    data: {
      totalBooks: bookStats.totalBooks,
      availableCopies: bookStats.available,
      issuedCount: totalIssued,
      overdueCount: totalOverdue,
      reservations: totalReservations,
      recentIssues,
      categoryBreakdown: categoryAgg.map(c => ({ name: c._id || 'Uncategorized', value: c.count })),
    }
  });
});

const getAllIssues = asyncHandler(async (req, res) => {
  const issues = await BookIssue.find()
    .populate('book', 'title author isbn')
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } })
    .sort({ issueDate: -1 });
  res.json({ success: true, data: issues });
});

// Student: fetch own issued books (all statuses)
const getMyIssues = asyncHandler(async (req, res) => {
  const Student = require('../models/Student');
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) { res.status(404); throw new Error('Student profile not found'); }

  // Auto-mark overdue for this student
  await BookIssue.updateMany(
    { student: student._id, status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  const issues = await BookIssue.find({ student: student._id })
    .populate('book', 'title author isbn category coverImage')
    .sort({ issueDate: -1 });
  res.json({ success: true, data: issues });
});

module.exports = { getBooks, addBook, issueBook, returnBook, reserveBook, getReservations, updateReservation, getAllIssues, getLibraryStats, getMyIssues };
