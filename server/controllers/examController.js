const asyncHandler = require('express-async-handler');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Course = require('../models/Course');
const Student = require('../models/Student');

const getExams = asyncHandler(async (req, res) => {
  let { department, semester } = req.query;

  // Student role — auto-inject their own dept + semester
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) { res.status(404); throw new Error('Student profile not found'); }
    department = profile.department.toString();
    semester   = String(profile.semester);
  }

  let filter = {};
  if (department || semester) {
    const courseFilter = {};
    if (department) courseFilter.department = department;
    if (semester)   courseFilter.semester   = Number(semester);
    const courses = await Course.find(courseFilter).select('_id');
    filter.course = { $in: courses.map(c => c._id) };
  }

  const exams = await Exam.find(filter)
    .populate({ path: 'course', populate: { path: 'department', select: 'name code' } })
    .sort({ date: 1 });
  res.json({ success: true, data: exams });
});

const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create(req.body);
  const populated = await exam.populate({ path: 'course', populate: { path: 'department', select: 'name code' } });
  res.status(201).json({ success: true, data: populated });
});

const deleteExam = asyncHandler(async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Exam deleted' });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate({ path: 'course', populate: { path: 'department', select: 'name code' } });
  if (!exam) { res.status(404); throw new Error('Exam not found'); }
  res.json({ success: true, data: exam });
});

// Enter / update marks for a student
const enterResult = asyncHandler(async (req, res) => {
  const { studentId, examId, marksObtained } = req.body;
  const exam = await Exam.findById(examId);
  if (!exam) { res.status(404); throw new Error('Exam not found'); }

  if (marksObtained < 0 || marksObtained > exam.totalMarks) {
    res.status(400); throw new Error(`Marks must be between 0 and ${exam.totalMarks}`);
  }

  const pct = (marksObtained / exam.totalMarks) * 100;
  const grade =
    pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' :
    pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
  const status = marksObtained >= exam.passingMarks ? 'pass' : 'fail';

  const result = await Result.findOneAndUpdate(
    { student: studentId, exam: examId },
    { marksObtained, grade, status },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: result });
});

// Bulk marks entry for an exam
const enterBulkResults = asyncHandler(async (req, res) => {
  const { examId, results } = req.body; // results: [{ studentId, marksObtained }]
  const exam = await Exam.findById(examId);
  if (!exam) { res.status(404); throw new Error('Exam not found'); }

  // Validate all marks before saving
  const invalid = results.filter(r => r.marksObtained < 0 || r.marksObtained > exam.totalMarks);
  if (invalid.length > 0) {
    res.status(400);
    throw new Error(`Marks must be between 0 and ${exam.totalMarks} (totalMarks)`);
  }

  const ops = results.map(r => {
    const pct = (r.marksObtained / exam.totalMarks) * 100;
    const grade =
      pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' :
      pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
    const status = r.marksObtained >= exam.passingMarks ? 'pass' : 'fail';
    return {
      updateOne: {
        filter: { student: r.studentId, exam: examId },
        update: { $set: { marksObtained: r.marksObtained, grade, status } },
        upsert: true,
      },
    };
  });

  await Result.bulkWrite(ops);
  res.json({ success: true, message: 'Results saved' });
});

// Get all results for a student with CGPA
const getStudentResults = asyncHandler(async (req, res) => {
  // Students can only fetch their own results
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile || profile._id.toString() !== req.params.id) {
      res.status(403); throw new Error('Not authorized to view these results');
    }
  }
  const results = await Result.find({ student: req.params.id })
    .populate({
      path: 'exam',
      populate: { path: 'course', select: 'name code credits semester' },
    })
    .sort({ createdAt: -1 });

  // Calculate CGPA from all passed results
  let totalCredits = 0, weightedGradePoints = 0;
  const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 };

  results.forEach(r => {
    if (r.status !== 'absent' && r.exam?.course?.credits) {
      const credits = r.exam.course.credits;
      const gp = gradePoints[r.grade] || 0;
      totalCredits += credits;
      weightedGradePoints += gp * credits;
    }
  });

  const cgpa = totalCredits > 0 ? (weightedGradePoints / totalCredits).toFixed(2) : null;

  res.json({ success: true, data: results, cgpa });
});

// Get results for an exam (all students)
const getExamResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ exam: req.params.examId })
    .populate({ path: 'student', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: results });
});

// Generate seating plan for an exam
// Splits enrolled students across halls, seatsPerHall per room
const generateSeatingPlan = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate({ path: 'course', select: 'name semester department', populate: { path: 'department', select: 'name' } });
  if (!exam) { res.status(404); throw new Error('Exam not found'); }

  const { halls = ['Hall A', 'Hall B', 'Hall C'], seatsPerHall = 30 } = req.query;
  const hallList = Array.isArray(halls) ? halls : halls.split(',').map(h => h.trim());

  // Get students for the exam's course department + semester
  const filter = {};
  if (exam.course?.department?._id) filter.department = exam.course.department._id;
  if (exam.course?.semester) filter.semester = exam.course.semester;

  const students = await Student.find(filter)
    .populate('userId', 'name')
    .sort({ enrollmentNo: 1 });

  // Assign seats
  const seatingPlan = [];
  let hallIdx = 0, seatNo = 1;

  for (const student of students) {
    if (seatNo > Number(seatsPerHall)) { hallIdx++; seatNo = 1; }
    if (hallIdx >= hallList.length) break; // no more halls

    seatingPlan.push({
      seatNo,
      hall: hallList[hallIdx],
      studentName: student.userId?.name,
      enrollmentNo: student.enrollmentNo,
    });
    seatNo++;
  }

  res.json({
    success: true,
    exam: { course: exam.course?.name, type: exam.type, date: exam.date },
    totalStudents: students.length,
    halls: hallList,
    seatsPerHall: Number(seatsPerHall),
    seatingPlan,
  });
});

// GET /api/exams/my-hall-ticket — student gets their own hall ticket for all upcoming exams
const getMyHallTicket = asyncHandler(async (req, res) => {
  const profile = await Student.findOne({ userId: req.user._id })
    .populate('userId', 'name email')
    .populate('department', 'name code');
  if (!profile) { res.status(404); throw new Error('Student profile not found'); }

  // Get all upcoming exams for this student's dept + semester
  const courses = await Course.find({
    department: profile.department._id,
    semester: profile.semester,
  }).select('_id name code');

  const courseIds = courses.map(c => c._id);
  const exams = await Exam.find({ course: { $in: courseIds } })
    .populate({ path: 'course', select: 'name code credits', populate: { path: 'department', select: 'name code' } })
    .sort({ date: 1 });

  // For each exam, find this student's seat using the same deterministic sort (enrollmentNo asc)
  const DEFAULT_HALLS = ['Hall A', 'Hall B', 'Hall C'];
  const SEATS_PER_HALL = 30;

  const hallTicketExams = await Promise.all(exams.map(async (exam) => {
    // Get all students in same dept+semester sorted by enrollmentNo
    const allStudents = await Student.find({
      department: profile.department._id,
      semester: profile.semester,
    }).select('_id enrollmentNo').sort({ enrollmentNo: 1 });

    const myIndex = allStudents.findIndex(s => s._id.toString() === profile._id.toString());
    let hall = exam.hall || DEFAULT_HALLS[0];
    let seatNo = null;

    if (myIndex !== -1) {
      const hallIdx = Math.floor(myIndex / SEATS_PER_HALL);
      seatNo = (myIndex % SEATS_PER_HALL) + 1;
      hall = exam.hall || DEFAULT_HALLS[Math.min(hallIdx, DEFAULT_HALLS.length - 1)];
    }

    return {
      examId: exam._id,
      courseName: exam.course?.name,
      courseCode: exam.course?.code,
      type: exam.type,
      date: exam.date,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      hall,
      seatNo,
    };
  }));

  res.json({
    success: true,
    data: {
      student: {
        name: profile.userId?.name,
        email: profile.userId?.email,
        enrollmentNo: profile.enrollmentNo,
        department: profile.department?.name,
        departmentCode: profile.department?.code,
        semester: profile.semester,
        batch: profile.batch,
      },
      exams: hallTicketExams,
    },
  });
});

module.exports = { getExams, createExam, deleteExam, updateExam, enterResult, enterBulkResults, getStudentResults, getExamResults, generateSeatingPlan, getMyHallTicket };
