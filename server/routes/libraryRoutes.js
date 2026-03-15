const express = require('express');
const router = express.Router();
const { getBooks, addBook, issueBook, returnBook, reserveBook, getReservations, updateReservation, getAllIssues, getLibraryStats, getMyIssues } = require('../controllers/libraryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/books').get(getBooks).post(authorize('admin', 'superadmin'), addBook);
router.post('/issue', authorize('admin', 'superadmin'), issueBook);
router.put('/return/:id', authorize('admin', 'superadmin'), returnBook);
router.post('/reserve', reserveBook);
router.get('/reservations', authorize('admin', 'superadmin'), getReservations);
router.put('/reservations/:id', authorize('admin', 'superadmin'), updateReservation);
router.get('/my-issues', getMyIssues);                                    // student own books
router.get('/issues', authorize('admin', 'superadmin'), getAllIssues);
router.get('/stats', authorize('admin', 'superadmin'), getLibraryStats);

module.exports = router;
