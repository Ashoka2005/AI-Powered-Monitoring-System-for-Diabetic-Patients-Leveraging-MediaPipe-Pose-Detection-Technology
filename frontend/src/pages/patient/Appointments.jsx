import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiCalendar, FiClock } from 'react-icons/fi';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: { startTime: '09:00', endTime: '09:30' }, type: 'video', reason: '', symptoms: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apptRes, docRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/appointments/doctors/available'),
      ]);
      setAppointments(apptRes.data.data);
      setDoctors(docRes.data.data);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments', form);
      toast.success('Appointment booked!');
      setShowForm(false);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    setLoading(false);
  };

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          {user?.role === 'patient' && <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><FiPlus /> Book Appointment</button>}
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Book New Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Doctor</label>
                  <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} className="input-field" required>
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} {d.doctorInfo?.specialization ? `(${d.doctorInfo.specialization})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slot</label>
                  <select value={form.timeSlot.startTime} onChange={e => { const st = e.target.value; const et = `${parseInt(st.split(':')[0])}:${parseInt(st.split(':')[1]) + 30 < 60 ? (parseInt(st.split(':')[1]) + 30).toString().padStart(2, '0') : '00'}`; setForm({ ...form, timeSlot: { startTime: st, endTime: et } }); }} className="input-field">
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat</option>
                    <option value="in_person">In Person</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input-field" rows={3} placeholder="Describe your reason for visit" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Booking...' : 'Book Appointment'}</button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {appointments.length === 0 && <p className="text-gray-500 text-center py-8">No appointments found</p>}
          {appointments.map(appt => (
            <div key={appt._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : appt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{appt.status}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">{appt.type}</span>
                </div>
                <p className="font-semibold">{appt.reason}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <FiCalendar className="text-gray-400" /> {new Date(appt.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  <FiClock className="text-gray-400 ml-2" /> {appt.timeSlot.startTime} - {appt.timeSlot.endTime}
                </p>
                {user?.role === 'patient' && appt.doctorId && <p className="text-sm text-gray-500 mt-1">Dr. {appt.doctorId.firstName} {appt.doctorId.lastName}</p>}
                {user?.role === 'doctor' && appt.patientId && <p className="text-sm text-gray-500 mt-1">Patient: {appt.patientId.firstName} {appt.patientId.lastName}</p>}
              </div>
              {appt.status === 'pending' && user?.role === 'doctor' && (
                <div className="flex gap-2">
                  <button onClick={async () => { await api.put(`/appointments/${appt._id}/status`, { status: 'confirmed' }); toast.success('Confirmed'); loadData(); }} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">Confirm</button>
                  <button onClick={async () => { await api.put(`/appointments/${appt._id}/status`, { status: 'cancelled' }); toast.success('Cancelled'); loadData(); }} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
