import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Home, Plus, Users, Wrench, X, CheckCircle, UtensilsCrossed, Edit2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

export default function Hostel() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);
  const isStudent = user?.role === 'student';
  // students: check if they have a room allocated (for My Room + Maintenance tabs)
  const [hasRoom, setHasRoom] = useState(null); // null=loading, true, false
  const [tab, setTab] = useState(isAdmin ? 'Rooms' : isStudent ? 'My Room' : 'Mess Menu');

  const tabs = isAdmin
    ? ['Rooms', 'Warden Dashboard', 'Maintenance', 'Mess Menu']
    : isStudent
    ? ['My Room', 'Maintenance', 'Mess Menu']
    : ['Mess Menu']; // faculty / other — only mess menu makes sense

  useEffect(() => {
    if (isStudent) {
      api.get('/students/me')
        .then(res => setHasRoom(!!res.data.data?.hostelId))
        .catch(() => setHasRoom(false));
    }
  }, [isStudent]);

  // Students: show loading spinner while checking room status
  if (isStudent && hasRoom === null) {
    return <div className="text-center py-20 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Hostel Management</h1>
        <p className="text-sm text-slate-500">Room allocation and maintenance requests</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Rooms' && <RoomsTab isAdmin={isAdmin} />}
      {tab === 'Warden Dashboard' && <WardenDashboard />}
      {tab === 'My Room' && <MyRoomTab hasRoom={hasRoom} />}
      {tab === 'Maintenance' && <MaintenanceTab isAdmin={isAdmin} isStudent={isStudent} hasRoom={hasRoom} />}
      {tab === 'Mess Menu' && <MessMenuTab isAdmin={isAdmin} />}
    </div>
  );
}

// ─── Rooms Tab ────────────────────────────────────────────────────────────────
function RoomsTab({ isAdmin }) {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [allocateRoom, setAllocateRoom] = useState(null);
  const [allocateStudent, setAllocateStudent] = useState('');
  const [transferModal, setTransferModal] = useState(null); // { room, occupant }
  const [transferToRoom, setTransferToRoom] = useState('');
  const [form, setForm] = useState({ roomNo: '', floor: '', capacity: 2, type: 'double', monthlyFee: '' });

  useEffect(() => {
    api.get('/hostel/rooms').then(r => { setRooms(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
    if (isAdmin) api.get('/students', { params: { limit: 1000 } }).then(r => setStudents(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hostel/rooms', form);
      setRooms(prev => [...prev, res.data.data]);
      toast.success('Room created');
      setShowForm(false);
      setForm({ roomNo: '', floor: '', capacity: 2, type: 'double', monthlyFee: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleAllocate = async () => {
    if (!allocateStudent) { toast.error('Select a student'); return; }
    try {
      const res = await api.post(`/hostel/rooms/${allocateRoom._id}/allocate`, { studentId: allocateStudent });
      setRooms(prev => prev.map(r => r._id === allocateRoom._id ? res.data.data : r));
      toast.success('Room allocated');
      setAllocateRoom(null);
      setAllocateStudent('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleRemove = async (roomId, studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this room?`)) return;
    try {
      const res = await api.post(`/hostel/rooms/${roomId}/remove`, { studentId });
      setRooms(prev => prev.map(r => r._id === roomId ? res.data.data : r));
      toast.success(`${studentName} removed from room`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleTransfer = async () => {
    if (!transferToRoom) { toast.error('Select a target room'); return; }
    try {
      const res = await api.post(`/hostel/rooms/${transferModal.room._id}/transfer`, {
        studentId: transferModal.occupant._id,
        toRoomId: transferToRoom,
      });
      setRooms(prev => prev.map(r => {
        if (r._id === res.data.data.fromRoom._id) return res.data.data.fromRoom;
        if (r._id === res.data.data.toRoom._id)   return res.data.data.toRoom;
        return r;
      }));
      toast.success(`${transferModal.occupant.userId?.name} transferred successfully`);
      setTransferModal(null);
      setTransferToRoom('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const typeColors = { single: 'bg-blue-50 text-blue-700', double: 'bg-indigo-50 text-indigo-700', triple: 'bg-purple-50 text-purple-700' };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Add Room
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
              <Home size={32} className="mx-auto mb-2 opacity-30" />
              <p>No rooms added yet</p>
            </div>
          ) : rooms.map(room => (
            <div key={room._id} className={`bg-white rounded-xl border p-5 ${room.isAvailable ? 'border-slate-200' : 'border-slate-300 opacity-80'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">Room {room.roomNo}</h3>
                  {room.floor !== undefined && <p className="text-xs text-slate-400">Floor {room.floor}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[room.type]}`}>{room.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {room.isAvailable ? 'Available' : 'Full'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                <span className="flex items-center gap-1"><Users size={13} /> {room.occupants?.length || 0} / {room.capacity}</span>
                {room.monthlyFee && <span className="text-indigo-600 font-medium">₹{room.monthlyFee}/mo</span>}
              </div>
              {/* Occupancy bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }} />
              </div>
              {/* Occupants list */}
              {room.occupants?.length > 0 && (
                <div className="mb-3 space-y-1">
                  {room.occupants.map(occ => (
                    <div key={occ._id} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">
                        {occ.userId?.name?.[0] || '?'}
                      </div>
                      <span className="font-medium truncate">{occ.userId?.name || 'Unknown'}</span>
                      <span className="text-slate-400 font-mono ml-auto shrink-0">{occ.enrollmentNo}</span>
                      {isAdmin && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setTransferModal({ room, occupant: occ }); setTransferToRoom(''); }}
                            title="Transfer to another room"
                            className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-medium">
                            Move
                          </button>
                          <button
                            onClick={() => handleRemove(room._id, occ._id, occ.userId?.name)}
                            title="Remove from room"
                            className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-medium">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isAdmin && room.isAvailable && (
                <button onClick={() => setAllocateRoom(room)}
                  className="w-full text-xs py-1.5 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                  Allocate Student
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Room</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateRoom} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Room No</label>
                <input type="text" required value={form.roomNo} onChange={e => setForm({ ...form, roomNo: e.target.value })}
                  placeholder="e.g. A-101"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Floor</label>
                <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Capacity</label>
                <input type="number" min={1} max={4} required value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Fee (₹)</label>
                <input type="number" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {allocateRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Allocate Room {allocateRoom.roomNo}</h2>
              <button onClick={() => setAllocateRoom(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Select Student</label>
              <select value={allocateStudent} onChange={e => setAllocateStudent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select student</option>
                {students.filter(s => !s.hostelId).map(s => (
                  <option key={s._id} value={s._id}>{s.userId?.name} ({s.enrollmentNo})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAllocateRoom(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleAllocate} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Allocate</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Transfer Student</h2>
              <button onClick={() => setTransferModal(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
              <p className="font-medium text-slate-800">{transferModal.occupant.userId?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {transferModal.occupant.enrollmentNo} — currently in Room {transferModal.room.roomNo}
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 mb-1">Transfer to Room</label>
              <select value={transferToRoom} onChange={e => setTransferToRoom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select room</option>
                {rooms
                  .filter(r => r._id !== transferModal.room._id && r.isAvailable)
                  .map(r => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNo} ({r.occupants?.length}/{r.capacity} occupied) — {r.type}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setTransferModal(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleTransfer} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Warden Dashboard ────────────────────────────────────────────────────────
function WardenDashboard() {
  const [rooms, setRooms] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/hostel/rooms'),
      api.get('/hostel/maintenance'),
    ]).then(([r, m]) => {
      setRooms(r.data.data || []);
      setMaintenance(m.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + (r.occupants?.length || 0), 0);
  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const pendingMaintenance = maintenance.filter(m => m.status === 'pending').length;
  const inProgressMaintenance = maintenance.filter(m => m.status === 'in-progress').length;
  const occupancyPct = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: totalRooms, color: 'bg-indigo-500', icon: Home },
          { label: 'Occupied Beds', value: `${totalOccupied} / ${totalCapacity}`, color: 'bg-emerald-500', icon: Users },
          { label: 'Available Rooms', value: availableRooms, color: 'bg-blue-500', icon: CheckCircle },
          { label: 'Pending Maintenance', value: pendingMaintenance, color: 'bg-amber-500', icon: Wrench },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-800">Overall Occupancy</h2>
          <span className="text-sm font-bold text-indigo-600">{occupancyPct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${occupancyPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{totalOccupied} beds occupied</span>
          <span>{totalCapacity - totalOccupied} beds free</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Room Type Breakdown</h2>
          {['single', 'double', 'triple'].map(type => {
            const typeRooms = rooms.filter(r => r.type === type);
            const typeOccupied = typeRooms.reduce((s, r) => s + (r.occupants?.length || 0), 0);
            const typeCap = typeRooms.reduce((s, r) => s + r.capacity, 0);
            const pct = typeCap > 0 ? ((typeOccupied / typeCap) * 100).toFixed(0) : 0;
            const colors = { single: 'bg-blue-500', double: 'bg-indigo-500', triple: 'bg-purple-500' };
            return (
              <div key={type} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">{type} ({typeRooms.length} rooms)</span>
                  <span className="text-slate-500">{typeOccupied}/{typeCap} — {pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${colors[type]} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Maintenance Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', count: pendingMaintenance, color: 'bg-amber-100 text-amber-700' },
              { label: 'In Progress', count: inProgressMaintenance, color: 'bg-blue-100 text-blue-700' },
              { label: 'Resolved', count: maintenance.filter(m => m.status === 'resolved').length, color: 'bg-green-100 text-green-700' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">{label}</span>
                <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${color}`}>{count}</span>
              </div>
            ))}
          </div>
          {pendingMaintenance > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recent Pending</p>
              <div className="space-y-2">
                {maintenance.filter(m => m.status === 'pending').slice(0, 3).map(m => (
                  <div key={m._id} className="text-xs text-slate-600 bg-amber-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Room {m.room?.roomNo}</span> — {m.issue}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All Rooms — Occupancy Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Room No', 'Floor', 'Type', 'Occupants', 'Capacity', 'Monthly Fee', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No rooms added yet</td></tr>
              ) : rooms.map(room => (
                <tr key={room._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">Room {room.roomNo}</td>
                  <td className="px-4 py-3 text-slate-600">{room.floor ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{room.type}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{room.occupants?.length || 0}</td>
                  <td className="px-4 py-3 text-slate-600">{room.capacity}</td>
                  <td className="px-4 py-3 text-slate-600">{room.monthlyFee ? `₹${room.monthlyFee}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {room.isAvailable ? 'Available' : 'Full'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── My Room (Student) ────────────────────────────────────────────────────────
function MyRoomTab({ hasRoom }) {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRoom) { setLoading(false); return; }
    api.get('/students/me').then(res => {
      const myProfile = res.data.data;
      if (myProfile?.hostelId) {
        api.get('/hostel/rooms').then(r => {
          const myRoom = r.data.data?.find(room =>
            room._id?.toString() === myProfile.hostelId?.toString() ||
            room._id?.toString() === myProfile.hostelId?._id?.toString()
          );
          setRoom(myRoom || null);
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, hasRoom]);

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  return (
    <div>
      {!room ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No Room Allocated</h3>
          <p className="text-sm text-slate-400">You have not been assigned a hostel room yet. Contact the hostel warden for allocation.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          {/* Room card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Room {room.roomNo}</h2>
                {room.floor !== undefined && <p className="text-xs text-slate-400 mt-0.5">Floor {room.floor}</p>}
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                  room.type === 'single' ? 'bg-blue-100 text-blue-700' :
                  room.type === 'double' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-purple-100 text-purple-700'
                }`}>{room.type}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {room.isAvailable ? 'Available' : 'Full'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Occupants', `${room.occupants?.length || 0} / ${room.capacity}`],
                ['Monthly Fee', room.monthlyFee ? `₹${room.monthlyFee}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Roommates */}
          {room.occupants?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Users size={15} className="text-indigo-500" /> Roommates
              </h3>
              <div className="space-y-2">
                {room.occupants.map(occ => (
                  <div key={occ._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {occ.userId?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{occ.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 font-mono">{occ.enrollmentNo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Maintenance ──────────────────────────────────────────────────────────────
function MaintenanceTab({ isAdmin, isStudent, hasRoom }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ room: '', issue: '' });
  const [studentId, setStudentId] = useState(null);
  const [myRoomId, setMyRoomId] = useState(null);
  const [myRoomNo, setMyRoomNo] = useState('');

  useEffect(() => {
    if (isAdmin) {
      Promise.all([
        api.get('/hostel/maintenance'),
        api.get('/hostel/rooms'),
      ]).then(([mRes, rRes]) => {
        setRequests(mRes.data.data || []);
        setRooms(rRes.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
    } else if (isStudent) {
      // Student: fetch own requests + own profile to get their room
      Promise.all([
        api.get('/hostel/maintenance/my'),
        api.get('/students/me'),
      ]).then(([mRes, sRes]) => {
        setRequests(mRes.data.data || []);
        const myProfile = sRes.data.data;
        if (myProfile) {
          setStudentId(myProfile._id);
          const roomId = myProfile.hostelId?._id?.toString() || myProfile.hostelId?.toString();
          if (roomId) {
            setMyRoomId(roomId);
            setForm(prev => ({ ...prev, room: roomId }));
            api.get('/hostel/rooms').then(r => {
              const myRoom = r.data.data?.find(rm => rm._id?.toString() === roomId);
              if (myRoom) setMyRoomNo(myRoom.roomNo);
            }).catch(() => {});
          }
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAdmin, isStudent, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isAdmin && !studentId) { toast.error('Student profile not found'); return; }
    try {
      const payload = isAdmin ? { ...form } : { ...form, requestedBy: studentId };
      await api.post('/hostel/maintenance', payload);
      toast.success('Request submitted');
      setShowForm(false);
      setForm(prev => ({ room: isAdmin ? '' : prev.room, issue: '' }));
      // Refresh requests
      if (isAdmin) {
        api.get('/hostel/maintenance').then(r => setRequests(r.data.data || [])).catch(() => {});
      } else {
        api.get('/hostel/maintenance/my').then(r => setRequests(r.data.data || [])).catch(() => {});
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.put(`/hostel/maintenance/${id}`, { status });
      setRequests(prev => prev.map(r => r._id === id ? res.data.data : r));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const statusColors = { pending: 'bg-amber-100 text-amber-700', 'in-progress': 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };

  // Student without a room can't raise maintenance requests
  const canRaiseRequest = isAdmin || (isStudent && hasRoom);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canRaiseRequest ? (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> New Request
          </button>
        ) : isStudent && !hasRoom ? (
          <p className="text-sm text-slate-400 italic">You need a room allocated to raise maintenance requests.</p>
        ) : null}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
              <Wrench size={32} className="mx-auto mb-2 opacity-30" />
              <p>No maintenance requests</p>
            </div>
          ) : requests.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800">Room {r.room?.roomNo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                </div>
                <p className="text-sm text-slate-600">{r.issue}</p>
                <p className="text-xs text-slate-400 mt-1">
                  By: {r.requestedBy?.enrollmentNo} • {new Date(r.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              {isAdmin && r.status !== 'resolved' && (
                <div className="flex gap-2 shrink-0">
                  {r.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(r._id, 'in-progress')}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                      Start
                    </button>
                  )}
                  <button onClick={() => handleStatusUpdate(r._id, 'resolved')}
                    className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                    <CheckCircle size={12} /> Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800">Maintenance Request</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
                {isAdmin ? (
                  <select required value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select room</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNo}</option>)}
                  </select>
                ) : (
                  <input readOnly value={myRoomNo ? `Room ${myRoomNo}` : 'Your room'}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed" />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Issue Description</label>
                <textarea required rows={3} value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mess Menu Tab ────────────────────────────────────────────────────────────
function MessMenuTab({ isAdmin }) {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const emptyMenu = () => Object.fromEntries(DAYS.map(d => [d, { breakfast: '', lunch: '', dinner: '' }]));
  const [form, setForm] = useState({ weekLabel: '', menu: emptyMenu() });

  useEffect(() => {
    api.get('/hostel/mess/active')
      .then(r => { setMenu(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ weekLabel: '', menu: emptyMenu() });
    setEditing(false);
    setShowForm(true);
  };

  const openEdit = () => {
    if (!menu) return;
    setForm({ weekLabel: menu.weekLabel, menu: { ...emptyMenu(), ...menu.menu } });
    setEditing(true);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editing && menu) {
        res = await api.put(`/hostel/mess/${menu._id}`, form);
      } else {
        res = await api.post('/hostel/mess', form);
      }
      setMenu(res.data.data);
      toast.success(editing ? 'Menu updated' : 'Menu created');
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const setMeal = (day, meal, val) => {
    setForm(prev => ({ ...prev, menu: { ...prev.menu, [day]: { ...prev.menu[day], [meal]: val } } }));
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end gap-2">
          {menu && (
            <button onClick={openEdit} className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">
              <Edit2 size={14} /> Edit Menu
            </button>
          )}
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> New Week Menu
          </button>
        </div>
      )}

      {!menu ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-30" />
          <p>No mess menu set for this week</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Weekly Mess Menu</h2>
              <p className="text-xs text-slate-400 mt-0.5">{menu.weekLabel}</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-28">Day</th>
                  {MEALS.map(m => <th key={m} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase capitalize">{m}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS.map(day => (
                  <tr key={day} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{day}</td>
                    {MEALS.map(meal => (
                      <td key={meal} className="px-4 py-3 text-slate-600">{menu.menu?.[day]?.[meal] || <span className="text-slate-300">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit' : 'New'} Mess Menu</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="mb-4 shrink-0">
                <label className="block text-xs font-medium text-slate-600 mb-1">Week Label</label>
                <input required value={form.weekLabel} onChange={e => setForm({ ...form, weekLabel: e.target.value })}
                  placeholder="e.g. Week of 10 Mar 2025"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-slate-500 w-28">Day</th>
                      {MEALS.map(m => <th key={m} className="text-left py-2 px-2 text-xs font-semibold text-slate-500 capitalize">{m}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-t border-slate-100">
                        <td className="py-2 pr-3 font-medium text-slate-700 text-sm">{day}</td>
                        {MEALS.map(meal => (
                          <td key={meal} className="py-1.5 px-2">
                            <input value={form.menu[day]?.[meal] || ''} onChange={e => setMeal(day, meal, e.target.value)}
                              placeholder={`${meal}...`}
                              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 justify-end mt-4 shrink-0">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {editing ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
