const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  floor: { type: Number },
  capacity: { type: Number, default: 2 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  type: { type: String, enum: ['single', 'double', 'triple'], default: 'double' },
  isAvailable: { type: Boolean, default: true },
  monthlyFee: { type: Number },
}, { timestamps: true });

const maintenanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  issue: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  resolvedAt: { type: Date },
}, { timestamps: true });

// Weekly mess menu — one document per week
const messMenuSchema = new mongoose.Schema({
  weekLabel: { type: String, required: true }, // e.g. "Week of 10 Mar 2025"
  menu: {
    Monday:    { breakfast: String, lunch: String, dinner: String },
    Tuesday:   { breakfast: String, lunch: String, dinner: String },
    Wednesday: { breakfast: String, lunch: String, dinner: String },
    Thursday:  { breakfast: String, lunch: String, dinner: String },
    Friday:    { breakfast: String, lunch: String, dinner: String },
    Saturday:  { breakfast: String, lunch: String, dinner: String },
    Sunday:    { breakfast: String, lunch: String, dinner: String },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);
const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceSchema);
const MessMenu = mongoose.model('MessMenu', messMenuSchema);

module.exports = { HostelRoom, MaintenanceRequest, MessMenu };
