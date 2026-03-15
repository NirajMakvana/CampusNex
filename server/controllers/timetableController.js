const asyncHandler = require('express-async-handler');
const Timetable = require('../models/Timetable');
const Student   = require('../models/Student');

const getTimetable = asyncHandler(async (req, res) => {
  let { department, semester, academicYear } = req.query;

  // Student role — auto-inject their own dept + semester, ignore query params
  if (req.user.role === 'student') {
    const profile = await Student.findOne({ userId: req.user._id });
    if (!profile) { res.status(404); throw new Error('Student profile not found'); }
    department = profile.department.toString();
    semester   = String(profile.semester);
  }

  const filter = {};
  if (department)   filter.department   = department;
  if (semester)     filter.semester     = Number(semester);
  if (academicYear) filter.academicYear = academicYear;

  const timetable = await Timetable.find(filter)
    .populate('slots.course', 'name code')
    .populate({ path: 'slots.faculty', populate: { path: 'userId', select: 'name' } })
    .populate('department', 'name code')
    .sort({ day: 1 });
  res.json({ success: true, data: timetable });
});

const saveTimetableDay = asyncHandler(async (req, res) => {
  const { department, semester, day, slots, academicYear } = req.body;

  // Conflict detection: check if any faculty is double-booked at the same time on the same day
  // Search ALL timetable entries for this day/year EXCEPT the one being saved
  const existing = await Timetable.find({
    day,
    academicYear,
    $nor: [{ department, semester }], // exclude the exact entry being updated
  });

  for (const slot of slots) {
    if (!slot.faculty && !slot.room) continue; // skip empty slots
    for (const ex of existing) {
      const conflict = ex.slots.find(s =>
        s.time === slot.time &&
        ((slot.faculty && s.faculty?.toString() === slot.faculty?.toString()) ||
         (slot.room && slot.room.trim() !== '' && s.room === slot.room))
      );
      if (conflict) {
        res.status(409);
        throw new Error(`Conflict at ${slot.time} — faculty or room already booked in another class`);
      }
    }
  }

  const entry = await Timetable.findOneAndUpdate(
    { department, semester, day, academicYear },
    { slots },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: entry });
});

const deleteTimetableDay = asyncHandler(async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getTimetable, saveTimetableDay, deleteTimetableDay };
