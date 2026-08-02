import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiCalendar, FiAlertTriangle, FiTrendingUp, FiTrash2 } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this exercise session?")) return;
    try {
      await api.delete(`/exercises/session/${sessionId}`);
      toast.success("Exercise session deleted successfully");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to delete exercise session");
    }
  };

  const stats = data?.exerciseStats || {};
  const bloodSugarData = data?.bloodSugarTrend || [];

  const chartData = {
    labels: bloodSugarData.map(d => d._id?.slice(5) || ''),
    datasets: [{
      label: 'Avg Blood Sugar (mg/dL)',
      data: bloodSugarData.map(d => d.avgSugar),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600 mt-1">Here's your health overview for the past 30 days</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FiActivity /></div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions || 0}</p>
                <p className="text-sm text-gray-500">Exercise Sessions</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><FiTrendingUp /></div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgAccuracy || 0)}%</p>
                <p className="text-sm text-gray-500">Avg Accuracy</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><FiHeart /></div>
              <div>
                <p className="text-2xl font-bold">{Math.round((stats.totalCalories || 0))}</p>
                <p className="text-sm text-gray-500">Calories Burned</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><FiCalendar /></div>
              <div>
                <p className="text-2xl font-bold">{data?.upcomingAppointments?.length || 0}</p>
                <p className="text-sm text-gray-500">Upcoming Appts</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Blood Sugar Chart & Exercise History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blood Sugar Chart */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Blood Sugar Trend</h2>
              {bloodSugarData.length > 0 ? (
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }} />
              ) : (
                <p className="text-gray-500 text-center py-8">No blood sugar data yet. Start logging in Health Log.</p>
              )}
            </div>

            {/* Exercise History & Progress Table */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary-950">
                <FiActivity className="text-primary-600" /> Recent Exercise Sessions & Progress
              </h2>
              {data?.recentSessions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] text-gray-500 uppercase font-semibold">
                        <th className="pb-3 pl-2">Workout</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-center">Duration</th>
                        <th className="pb-3 text-center">Completed</th>
                        <th className="pb-3 text-center">Form Accuracy</th>
                        <th className="pb-3 text-right">Calories</th>
                        <th className="pb-3 text-center pr-2">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {data.recentSessions.map(session => {
                        const ex = session.exerciseId || {};
                        const dateObj = new Date(session.createdAt);
                        const dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        const minSecs = `${Math.floor(session.duration / 60)}m ${session.duration % 60}s`;
                        const accuracy = Math.round(session.accuracyScore);
                        
                        const isSitting = ['seated-march', 'seated-twist', 'ankle-pump'].includes(ex.slug);
                        const exerciseTypeTag = isSitting ? "Seated" : "Active";
                        const tagColor = isSitting 
                          ? "bg-teal-50 text-teal-600 border-teal-100 text-[10px]" 
                          : "bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px]";

                        return (
                          <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Image + Name */}
                            <td className="py-3 pl-2 flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                {ex.thumbnail ? (
                                  <img src={ex.thumbnail} alt={ex.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <div className="text-gray-400 font-bold text-xs">Ex</div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 leading-tight">{ex.name || 'Unknown'}</p>
                                <span className={`inline-block border rounded-full px-1.5 py-0.2 mt-0.5 ${tagColor}`}>
                                  {exerciseTypeTag}
                                </span>
                              </div>
                            </td>
                            {/* Date */}
                            <td className="py-3 text-gray-600">{dateFormatted}</td>
                            {/* Duration */}
                            <td className="py-3 text-center text-gray-700 font-medium">{minSecs}</td>
                            {/* Reps/Sets */}
                            <td className="py-3 text-center">
                              <span className="font-bold text-gray-800">{session.repsCompleted}</span> reps 
                              <span className="text-gray-400 text-xs mx-1">/</span>
                              <span className="font-bold text-gray-800">{session.setsCompleted}</span> sets
                            </td>
                            {/* Accuracy */}
                            <td className="py-3">
                              <div className="flex flex-col items-center justify-center">
                                <span className={`font-bold text-xs ${
                                  accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{accuracy}%</span>
                                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                                  <div 
                                    className={`h-1 rounded-full ${
                                      accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${accuracy}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            {/* Calories */}
                            <td className="py-3 text-right font-bold text-orange-600">{session.caloriesBurned} kcal</td>
                            {/* Delete Action */}
                            <td className="py-3 text-center pr-2">
                              <button 
                                onClick={() => handleDeleteSession(session._id)}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete Session"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-3">No exercise sessions logged in the last 30 days.</p>
                  <Link to="/exercise" className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary-700 transition">
                    Start Your First Session
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions, Upcoming Appts, Alerts */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/exercise" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                  <FiActivity /> Start Exercise
                </Link>
                <Link to="/health" className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition">
                  <FiHeart /> Log Blood Sugar
                </Link>
                <Link to="/diet" className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition">
                  <FiTrendingUp /> View Diet Plan
                </Link>
              </div>
            </div>

            {/* Upcoming Doctor Appointments List */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary-950">
                <FiCalendar className="text-primary-600" /> Doctor Appointments
              </h2>
              {data?.upcomingAppointments?.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingAppointments.map(appt => {
                    const dateObj = new Date(appt.date);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                    const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={appt._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            Dr. {appt.doctorId?.firstName} {appt.doctorId?.lastName}
                          </p>
                          <p className="text-[11px] text-gray-500 capitalize">
                            {appt.doctorId?.doctorInfo?.specialization || 'Endocrinology'}
                          </p>
                          <div className="flex gap-2 items-center text-[10px] text-gray-400 mt-2">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          appt.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-xs">No upcoming doctor appointments scheduled.</p>
              )}
            </div>

            {/* Alerts */}
            {data?.recentAlerts?.length > 0 && (
              <div className="card border-red-200">
                <h2 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2"><FiAlertTriangle /> Alerts</h2>
                <div className="space-y-2">
                  {data.recentAlerts.map(alert => (
                    <div key={alert._id} className="p-2 bg-red-50 rounded text-sm">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-gray-600 text-xs">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
