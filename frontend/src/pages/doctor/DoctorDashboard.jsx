import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiActivity, FiLogOut, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('my');
  const [totalPlatformPatients, setTotalPlatformPatients] = useState(0);
  const [myPatientsCount, setMyPatientsCount] = useState(0);

  useEffect(() => {
    loadData(scope);
  }, [scope]);

  const loadData = async (currentScope) => {
    try {
      const [patRes, apptRes] = await Promise.all([
        api.get(`/doctor/patients?scope=${currentScope}`),
        api.get('/appointments?upcoming=true'),
      ]);
      setPatients(patRes.data.data);
      setTotalPlatformPatients(patRes.data.totalPlatformPatients || patRes.data.data.length);
      setMyPatientsCount(patRes.data.myPatientsCount || patRes.data.data.length);
      setAppointments(apptRes.data.data);
    } catch {}
  };

  const selectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const res = await api.get(`/doctor/patients/${patient._id}`);
      setPatientData(res.data.data);
    } catch {}
  };

  const filteredPatients = patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()));

  const bloodSugarChart = patientData?.recentHealthRecords?.filter(r => ['fasting', 'postprandial', 'random'].includes(r.metricType)) ? {
    labels: patientData.recentHealthRecords.filter(r => ['fasting', 'postprandial', 'random'].includes(r.metricType)).map(r => new Date(r.recordedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })).reverse(),
    datasets: [{ label: 'Blood Sugar', data: patientData.recentHealthRecords.filter(r => ['fasting', 'postprandial', 'random'].includes(r.metricType)).map(r => r.value).reverse(), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-white border-r flex-col">
        <div className="p-6 border-b"><div className="flex items-center gap-2"><div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">D</div><span className="font-bold text-lg">DiaFit AI</span></div><p className="text-xs text-gray-500 mt-1">Doctor Portal</p></div>
        <nav className="flex-1 p-4 space-y-1">
          <button className="sidebar-link-active w-full"><FiUsers /> Patients</button>
          <button onClick={() => navigate('/appointments')} className="sidebar-link w-full"><FiCalendar /> Appointments</button>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">Dr</div>
            <div><p className="text-sm font-medium">Dr. {user?.firstName} {user?.lastName}</p><p className="text-xs text-gray-500">{user?.doctorInfo?.specialization}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="sidebar-link w-full text-red-500"><FiLogOut /> Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="page-container">
          <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat-card"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FiUsers /></div><div><p className="text-2xl font-bold">{myPatientsCount}</p><p className="text-sm text-gray-500">My Patients</p></div></div></div>
            <div className="stat-card"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><FiUsers /></div><div><p className="text-2xl font-bold">{totalPlatformPatients}</p><p className="text-sm text-gray-500">Total App Patients</p></div></div></div>
            <div className="stat-card"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><FiCalendar /></div><div><p className="text-2xl font-bold">{appointments.length}</p><p className="text-sm text-gray-500">Upcoming Appts</p></div></div></div>
            <div className="stat-card"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><FiActivity /></div><div><p className="text-2xl font-bold">{user?.doctorInfo?.rating || 0}</p><p className="text-sm text-gray-500">Rating</p></div></div></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="card">
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setScope('my')}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition ${scope === 'my' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  My Assigned ({myPatientsCount})
                </button>
                <button
                  onClick={() => setScope('all')}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition ${scope === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  All Platform ({totalPlatformPatients})
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                <FiSearch className="text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." className="flex-1 outline-none text-sm bg-transparent" />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.map(p => (
                  <button key={p._id} onClick={() => selectPatient(p)} className={`w-full text-left p-3 rounded-lg transition ${selectedPatient?._id === p._id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}`}>
                    <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">{p.patientInfo?.diabetesType ? `${p.patientInfo.diabetesType} diabetes` : 'No type set'}</p>
                  </button>
                ))}
                {filteredPatients.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No patients found</p>}
              </div>
            </div>

            {/* Patient Detail */}
            <div className="lg:col-span-2">
              {selectedPatient && patientData ? (
                <div className="space-y-4">
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-2">{patientData.patient.firstName} {patientData.patient.lastName}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                      <div><span className="text-gray-500">Email:</span> <p className="font-medium">{patientData.patient.email}</p></div>
                      <div><span className="text-gray-500">Diabetes:</span> <p className="font-medium capitalize">{patientData.patient.patientInfo?.diabetesType || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Blood Group:</span> <p className="font-medium">{patientData.patient.profile?.bloodGroup || 'N/A'}</p></div>
                      <div><span className="text-gray-500">Phone:</span> <p className="font-medium">{patientData.patient.phone || 'N/A'}</p></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <p className="font-medium">
                          {patientData.patient.profile?.dateOfBirth
                            ? new Date().getFullYear() - new Date(patientData.patient.profile.dateOfBirth).getFullYear()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">BMI:</span>
                        <p className="font-medium">{patientData.patient.bmi || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Exercises Done:</span>
                        <p className="font-medium text-primary-600">{patientData.recentExercises?.length || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Accuracy:</span>
                        <p className="font-medium text-green-600">
                          {patientData.recentExercises?.length > 0
                            ? `${Math.round(patientData.recentExercises.reduce((acc, curr) => acc + curr.accuracyScore, 0) / patientData.recentExercises.length)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {bloodSugarChart && (
                    <div className="card"><h3 className="font-semibold mb-3">Blood Sugar Trend</h3><Line data={bloodSugarChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>
                  )}

                  {patientData.recentAlerts?.length > 0 && (
                    <div className="card border-red-200">
                      <h3 className="font-semibold mb-2 text-red-600 flex items-center gap-2"><FiAlertTriangle /> Active Alerts</h3>
                      {patientData.recentAlerts.map(a => <div key={a._id} className="p-2 bg-red-50 rounded text-sm mb-2"><p className="font-medium">{a.title}</p><p className="text-gray-600">{a.message}</p></div>)}
                    </div>
                  )}

                  <div className="card">
                    <h3 className="font-semibold mb-3">Recent Exercise Sessions</h3>
                    {patientData.recentExercises?.length > 0 ? patientData.recentExercises.map(s => (
                      <div key={s._id} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                        <span>{s.exerciseId?.name || 'Exercise'}</span>
                        <span className="text-gray-500">{s.repsCompleted} reps | {s.accuracyScore}% accuracy | {new Date(s.startTime).toLocaleDateString()}</span>
                      </div>
                    )) : <p className="text-gray-500 text-sm">No recent exercise sessions</p>}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-16"><p className="text-gray-500">Select a patient to view their details</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
