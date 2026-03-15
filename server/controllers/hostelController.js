const asyncHandler = require('express-async-handler');
const { HostelRoom, MaintenanceRequest, MessMenu } = require('../models/Hostel');
const Student = require('../models/Student');

const getRooms = asyncHandler(async (req, res) => {
  // Students can only see their own room
  if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student?.hostelId) return res.json({ success: true, data: [] });
    const room = await HostelRoom.findById(student.hostelId)
      .populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } });
    return res.json({ success: true, data: room ? [room] : [] });
  }
  const rooms = await HostelRoom.find()
    .populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: rooms });
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await HostelRoom.create(req.body);
  res.status(201).json({ success: true, data: room });
});

const allocateRoom = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const room = await HostelRoom.findById(req.params.id);
  if (!room) { res.status(404); throw new Error('Room not found'); }
  if (room.occupants.length >= room.capacity) {
    res.status(400); throw new Error('Room is full');
  }
  room.occupants.push(studentId);
  room.isAvailable = room.occupants.length < room.capacity;
  await room.save();
  await Student.findByIdAndUpdate(studentId, { hostelId: room._id });
  const populated = await HostelRoom.findById(room._id)
    .populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: populated });
});

const removeOccupant = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const room = await HostelRoom.findById(req.params.id);
  if (!room) { res.status(404); throw new Error('Room not found'); }
  room.occupants = room.occupants.filter(id => id.toString() !== studentId);
  room.isAvailable = room.occupants.length < room.capacity;
  await room.save();
  await Student.findByIdAndUpdate(studentId, { $unset: { hostelId: '' } });
  const populated = await HostelRoom.findById(room._id)
    .populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } });
  res.json({ success: true, data: populated });
});

const transferOccupant = asyncHandler(async (req, res) => {
  const { studentId, toRoomId } = req.body;
  const fromRoom = await HostelRoom.findById(req.params.id);
  const toRoom   = await HostelRoom.findById(toRoomId);
  if (!fromRoom || !toRoom) { res.status(404); throw new Error('Room not found'); }
  if (toRoom.occupants.length >= toRoom.capacity) { res.status(400); throw new Error('Target room is full'); }

  // Remove from current room
  fromRoom.occupants = fromRoom.occupants.filter(id => id.toString() !== studentId);
  fromRoom.isAvailable = fromRoom.occupants.length < fromRoom.capacity;
  await fromRoom.save();

  // Add to new room
  toRoom.occupants.push(studentId);
  toRoom.isAvailable = toRoom.occupants.length < toRoom.capacity;
  await toRoom.save();

  await Student.findByIdAndUpdate(studentId, { hostelId: toRoomId });

  const [updatedFrom, updatedTo] = await Promise.all([
    HostelRoom.findById(fromRoom._id).populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } }),
    HostelRoom.findById(toRoom._id).populate({ path: 'occupants', populate: { path: 'userId', select: 'name' } }),
  ]);
  res.json({ success: true, data: { fromRoom: updatedFrom, toRoom: updatedTo } });
});

const getMyMaintenanceRequests = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.json({ success: true, data: [] });
  const requests = await MaintenanceRequest.find({ requestedBy: student._id })
    .populate('room', 'roomNo floor')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
});

const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const requests = await MaintenanceRequest.find()
    .populate('room', 'roomNo floor')
    .populate('requestedBy', 'enrollmentNo');
  res.json({ success: true, data: requests });
});

const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.create(req.body);
  res.status(201).json({ success: true, data: request });
});

const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, resolvedAt: req.body.status === 'resolved' ? new Date() : undefined },
    { new: true }
  );
  res.json({ success: true, data: request });
});

const getActiveMenu = asyncHandler(async (req, res) => {
  const menu = await MessMenu.findOne({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: menu || null });
});

const getAllMenus = asyncHandler(async (req, res) => {
  const menus = await MessMenu.find().sort({ createdAt: -1 });
  res.json({ success: true, data: menus });
});

const createMenu = asyncHandler(async (req, res) => {
  // Deactivate previous active menu
  await MessMenu.updateMany({ isActive: true }, { isActive: false });
  const menu = await MessMenu.create({ ...req.body, isActive: true });
  res.status(201).json({ success: true, data: menu });
});

const updateMenu = asyncHandler(async (req, res) => {
  const menu = await MessMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!menu) { res.status(404); throw new Error('Menu not found'); }
  res.json({ success: true, data: menu });
});

module.exports = { getRooms, createRoom, allocateRoom, removeOccupant, transferOccupant, getMyMaintenanceRequests, getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus, getActiveMenu, getAllMenus, createMenu, updateMenu };
