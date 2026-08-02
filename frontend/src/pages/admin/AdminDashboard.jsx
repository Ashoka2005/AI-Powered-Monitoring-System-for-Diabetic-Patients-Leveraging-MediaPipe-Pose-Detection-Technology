import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const tabs = ['Overview', 'Users', 'Exercises', 'Alerts'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">DiaFit AI Platform Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Administrator</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Overview' && <OverviewTab stats={stats} loading={loading} />}
              {activeTab === 'Users' && <UsersTab />}
              {activeTab === 'Exercises' && <ExercisesTab />}
              {activeTab === 'Alerts' && <AlertsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ───── Overview Tab ───── */
function OverviewTab({ stats, loading }) {
  if (loading) return <Spinner />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-indigo-500', icon: '👥' },
    { label: 'Patients', value: stats?.totalPatients || 0, color: 'bg-blue-500', icon: '🩺' },
    { label: 'Doctors', value: stats?.totalDoctors || 0, color: 'bg-green-500', icon: '⚕️' },
    { label: 'Exercise Sessions', value: stats?.totalExerciseSessions || 0, color: 'bg-purple-500', icon: '🏋️' },
    { label: 'Appointments', value: stats?.totalAppointments || 0, color: 'bg-yellow-500', icon: '📅' },
    { label: 'Unresolved Alerts', value: stats?.unresolvedAlerts || 0, color: 'bg-red-500', icon: '🚨' },
    { label: 'Health Records', value: stats?.totalHealthRecords || 0, color: 'bg-teal-500', icon: '📊' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <motion.div
            key={c.label}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <span className="text-3xl">{c.icon}</span>
            </div>
            <div className={`h-1 w-full ${c.color} rounded-full mt-3 opacity-70`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ───── Users Tab ───── */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
      setPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}/status`, updates);
      fetchUsers();
      setEditModal(null);
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'doctor' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditModal(u)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <p className="text-sm text-gray-600 mb-4">{editModal.firstName} {editModal.lastName} ({editModal.email})</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="edit-role"
                    defaultValue={editModal.role}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    defaultChecked={editModal.isActive !== false}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="edit-active" className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    const role = document.getElementById('edit-role').value;
                    const isActive = document.getElementById('edit-active').checked;
                    updateUserStatus(editModal._id, { role, isActive });
                  }}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >Save Changes</button>
                <button onClick={() => setEditModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───── Exercises Tab ───── */
function ExercisesTab() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'strength', difficulty: 'beginner', muscleGroups: '', duration: 10, caloriesPerMin: 5 });
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = async () => {
    try {
      const { data } = await api.get('/exercises');
      setExercises(data.data || []);
    } catch (err) {
      console.error('Exercises error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, muscleGroups: formData.muscleGroups.split(',').map(s => s.trim()).filter(Boolean) };
      if (editId) {
        await api.put(`/admin/exercises/${editId}`, payload);
      } else {
        await api.post('/admin/exercises', payload);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ name: '', description: '', category: 'strength', difficulty: 'beginner', muscleGroups: '', duration: 10, caloriesPerMin: 5 });
      fetchExercises();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (ex) => {
    setFormData({
      name: ex.name || '', description: ex.description || '', category: ex.category || 'strength',
      difficulty: ex.difficulty || 'beginner', muscleGroups: (ex.muscleGroups || []).join(', '),
      duration: ex.duration || 10, caloriesPerMin: ex.caloriesPerMin || 5,
    });
    setEditId(ex._id);
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this exercise?')) return;
    try {
      await api.delete(`/admin/exercises/${id}`);
      fetchExercises();
    } catch (err) {
      alert('Deactivate failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Exercise Management</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ name: '', description: '', category: 'strength', difficulty: 'beginner', muscleGroups: '', duration: 10, caloriesPerMin: 5 }); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >{showForm ? 'Cancel' : '+ Add Exercise'}</button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="balance">Balance</option>
                  <option value="rehabilitation">Rehabilitation</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Groups (comma-separated)</label>
                <input value={formData.muscleGroups} onChange={e => setFormData({...formData, muscleGroups: e.target.value})} placeholder="biceps, shoulders" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: +e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories/min</label>
                <input type="number" value={formData.caloriesPerMin} onChange={e => setFormData({...formData, caloriesPerMin: +e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {editId ? 'Update Exercise' : 'Create Exercise'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <motion.div key={ex._id} whileHover={{ scale: 1.01 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{ex.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{ex.category} · {ex.difficulty}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ex.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                  {ex.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ex.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{ex.duration}min</span>
                <span>·</span>
                <span>{ex.caloriesPerMin} cal/min</span>
                <span>·</span>
                <span>{(ex.muscleGroups || []).join(', ')}</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(ex)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
                <button onClick={() => handleDeactivate(ex._id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Deactivate</button>
              </div>
            </motion.div>
          ))}
          {exercises.length === 0 && <p className="text-gray-400 col-span-3 text-center py-8">No exercises found</p>}
        </div>
      )}
    </div>
  );
}

/* ───── Alerts Tab ───── */
function AlertsTab() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts?limit=50');
      setAlerts(data.data || []);
    } catch (err) {
      console.error('Alerts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id) => {
    try {
      await api.put(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl border p-4 ${severityColors[a.severity] || severityColors.info} ${a.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase">{a.severity}</span>
                    <span className="text-xs opacity-70">{a.type}</span>
                  </div>
                  <p className="font-medium mt-1">{a.title || a.message}</p>
                  <p className="text-sm opacity-80 mt-0.5">{a.description || ''}</p>
                  <p className="text-xs opacity-60 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                {!a.resolved && (
                  <button onClick={() => resolveAlert(a._id)} className="text-xs font-medium px-3 py-1 rounded-lg bg-white/50 hover:bg-white/80 border">
                    Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {alerts.length === 0 && <p className="text-gray-400 text-center py-8">No alerts</p>}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
}
