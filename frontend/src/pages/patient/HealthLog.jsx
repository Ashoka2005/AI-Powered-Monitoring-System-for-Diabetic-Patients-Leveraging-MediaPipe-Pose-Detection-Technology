import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../../context/AuthContext';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function HealthLog() {
  const { user, updateProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [trends, setTrends] = useState(null);
  const [glycemicScore, setGlycemicScore] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ metricType: 'fasting', value: '', unit: 'mg/dL', mealContext: '' });
  const [loading, setLoading] = useState(false);

  const [showDiabetesSetup, setShowDiabetesSetup] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [nextProcedure, setNextProcedure] = useState(null);

  const [intervalDays, setIntervalDays] = useState(15);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const getDateRangeText = (days) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} to ${end.toLocaleDateString('en-US', options)}`;
  };

  const determineProcedure = (type, value) => {
    const isType1 = type === 'type1';
    let status = 'normal';
    if (value < 70) status = 'low';
    else if (value <= 140) status = 'normal';
    else if (value <= 199) status = 'high';
    else status = 'very_high';

    let steps = [];
    let title = '';
    let alertType = 'info';

    if (status === 'low') {
      alertType = 'danger';
      title = `${isType1 ? 'Type 1' : 'Type 2'} Diabetes - Low Blood Sugar Alert (${value} mg/dL)`;
      steps = isType1 ? [
        "Consume 15g of fast-acting sugar (e.g., 4 oz fruit juice, 3-4 glucose tablets, or 1 tablespoon of honey).",
        "Rest quietly and wait exactly 15 minutes.",
        "Re-test your blood sugar level.",
        "If the reading is still below 70 mg/dL, repeat the 15g sugar intake and wait another 15 minutes.",
        "Ensure your Glucagon rescue kit is accessible. Call emergency services if symptoms worsen."
      ] : [
        "Eat or drink 15g of simple carbs (e.g., half a cup of juice or soda, or 3-4 candies).",
        "Wait 15 minutes and re-check your blood glucose.",
        "Once your sugar returns to normal, eat a small snack with protein and complex carbs (e.g., crackers with cheese or peanut butter) to stabilize it.",
        "Note this episode and discuss adjusting your oral diabetes medication with your doctor."
      ];
    } else if (status === 'normal') {
      alertType = 'success';
      title = `Perfect Blood Sugar Level! (${value} mg/dL)`;
      steps = [
        "Your blood glucose is in the optimal target range.",
        "Continue following your standard daily meal, hydration, and exercise plan.",
        "Log your next reading at your scheduled time."
      ];
    } else if (status === 'high') {
      alertType = 'warning';
      title = `${isType1 ? 'Type 1' : 'Type 2'} Diabetes - High Blood Sugar Alert (${value} mg/dL)`;
      steps = isType1 ? [
        "Administer a correction dose of rapid-acting insulin if advised by your endocrinologist.",
        "Drink 1-2 tall glasses of water to help your kidneys filter out excess glucose.",
        "Recheck your blood sugar level in 1 to 2 hours.",
        "Avoid high-carb meals or snacks until your sugar levels normalize."
      ] : [
        "Check if you missed a dose of your prescribed oral diabetes medication or insulin.",
        "Drink 2 glasses of water to prevent dehydration and flush glucose.",
        "Perform light, low-intensity exercise (e.g., a 15-minute walk) to help muscles consume glucose. Avoid strenuous workouts.",
        "Review your recent meal for carbohydrate triggers."
      ];
    } else {
      alertType = 'danger';
      title = `CRITICAL: Very High Blood Sugar Alert (${value} mg/dL)`;
      steps = isType1 ? [
        "Immediately test your urine or blood for KETONES.",
        "If ketones are moderate or high, contact your doctor immediately or go to the nearest Emergency Room to prevent Diabetic Ketoacidosis (DKA).",
        "Take correction insulin as prescribed by your medical team.",
        "DO NOT exercise while blood sugar is this high, as it can raise ketone levels further.",
        "Drink plenty of water and re-test sugar every hour."
      ] : [
        "Take your prescribed diabetes medications if you missed them.",
        "Hydrate heavily with water (avoid any sweetened drinks).",
        "Avoid any strenuous physical activity.",
        "Monitor for HHS warning signs: extreme thirst, frequent urination, nausea, vomiting, or rapid breathing.",
        "If blood sugar remains above 250 mg/dL for two consecutive readings, or if you feel ill, contact your doctor or seek emergency care."
      ];
    }

    return { title, steps, alertType, status };
  };

  const handleLogClick = () => {
    if (user?.role === 'patient' && !user?.patientInfo?.diabetesType) {
      setShowDiabetesSetup(true);
    } else {
      setShowForm(!showForm);
    }
  };

  const handleSelectDiabetesType = async (type) => {
    setSavingType(true);
    try {
      await updateProfile({
        patientInfo: {
          ...user.patientInfo,
          diabetesType: type
        }
      });
      setShowDiabetesSetup(false);
      setShowForm(true);
    } catch {
      toast.error('Failed to update diabetes profile');
    }
    setSavingType(false);
  };

  useEffect(() => {
    loadData(intervalDays);
  }, []);

  const loadData = async (days = intervalDays) => {
    try {
      const [recordsRes, trendsRes, scoreRes] = await Promise.all([
        api.get('/health?limit=100'),
        api.get(`/health/blood-sugar/trends?days=${days}`),
        api.get('/health/glycemic-score'),
      ]);
      setRecords(recordsRes.data.data);
      setTrends(trendsRes.data.data);
      setGlycemicScore(scoreRes.data.data);
    } catch {}
  };

  const handleIntervalChange = (days) => {
    setIntervalDays(days);
    loadData(days);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/health', form);
      toast.success('Health record saved');
      const val = parseFloat(form.value);
      const isSugar = ['fasting', 'postprandial', 'random'].includes(form.metricType);
      
      setForm({ metricType: 'fasting', value: '', unit: 'mg/dL', mealContext: '' });
      setShowForm(false);
      loadData();

      if (isSugar) {
        const procedure = determineProcedure(user?.patientInfo?.diabetesType, val);
        setNextProcedure(procedure);
      }
    } catch { toast.error('Failed to save'); }
    setLoading(false);
  };

  const predictRisk = async () => {
    try {
      const res = await api.post('/health/risk-prediction', { familyHistory: false, fastingGlucose: 120, hba1c: 6.0 });
      setRiskPrediction(res.data.data);
    } catch { toast.error('Prediction failed'); }
  };

  const bloodSugarRecords = trends?.records?.filter(r => ['fasting', 'postprandial', 'random'].includes(r.metricType)) || [];
  const chartData = {
    labels: bloodSugarRecords.map(r => new Date(r.recordedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Blood Sugar (mg/dL)',
      data: bloodSugarRecords.map(r => r.value),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const metricUnits = { fasting: 'mg/dL', postprandial: 'mg/dL', random: 'mg/dL', hba1c: '%', heart_rate: 'bpm', blood_pressure: 'mmHg', weight: 'kg', spo2: '%' };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Health Log</h1>
          <div className="flex gap-3">
            <button onClick={predictRisk} className="btn-secondary flex items-center gap-2"><FiTrendingUp /> AI Risk Prediction</button>
            <button onClick={handleLogClick} className="btn-primary flex items-center gap-2"><FiPlus /> Log Reading</button>
          </div>
        </div>

        {/* Glycemic Score */}
        {glycemicScore?.score > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 flex items-center gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${glycemicScore.score >= 80 ? 'bg-green-500' : glycemicScore.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {glycemicScore.score}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Glycemic Impact Score: {glycemicScore.grade}</h3>
              <p className="text-sm text-gray-600">Time in Range: {glycemicScore.factors?.timeInRange}% | Avg Glucose: {glycemicScore.factors?.averageGlucose} mg/dL | Est. A1c: {glycemicScore.factors?.estimatedA1c}%</p>
            </div>
          </motion.div>
        )}

        {/* Risk Prediction */}
        {riskPrediction && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 border-l-4 border-l-blue-500">
            <h3 className="font-semibold mb-2">AI Diabetic Risk Prediction</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className={`text-3xl font-bold ${riskPrediction.riskLevel === 'low' ? 'text-green-600' : riskPrediction.riskLevel === 'moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                {riskPrediction.riskScore}%
              </div>
              <div>
                <p className="font-medium capitalize">{riskPrediction.riskLevel} Risk</p>
                <p className="text-sm text-gray-500">Based on your health metrics</p>
              </div>
            </div>
            {riskPrediction.recommendations?.map((r, i) => <p key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#8226;</span>{r}</p>)}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold">Blood Sugar Trend</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Interval range: <span className="font-semibold text-blue-600">{getDateRangeText(intervalDays)}</span>
                </p>
              </div>
              <select
                value={intervalDays}
                onChange={e => handleIntervalChange(parseInt(e.target.value))}
                className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
              >
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            {bloodSugarRecords.length > 0 ? (
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, min: 50 } } }} />
            ) : (
              <p className="text-gray-500 text-center py-8">Log blood sugar readings to see trends</p>
            )}
          </div>

          {/* Add Form */}
          <div>
            {showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card mb-4">
                <h3 className="font-semibold mb-3">New Reading</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <select value={form.metricType} onChange={e => { setForm({ ...form, metricType: e.target.value, unit: metricUnits[e.target.value] || '' }); }} className="input-field">
                    <option value="fasting">Fasting Blood Sugar</option>
                    <option value="postprandial">Postprandial (After Meal)</option>
                    <option value="random">Random Blood Sugar</option>
                    <option value="hba1c">HbA1c</option>
                    <option value="heart_rate">Heart Rate</option>
                    <option value="blood_pressure">Blood Pressure (Systolic)</option>
                    <option value="weight">Weight</option>
                    <option value="spo2">SpO2</option>
                  </select>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })} className="input-field" placeholder={`Value (${form.unit})`} required />
                  {['fasting', 'postprandial', 'random'].includes(form.metricType) && (
                    <select value={form.mealContext} onChange={e => setForm({ ...form, mealContext: e.target.value })} className="input-field">
                      <option value="">Meal context (optional)</option>
                      <option value="fasting">Fasting</option>
                      <option value="before_meal">Before Meal</option>
                      <option value="after_meal">After Meal</option>
                      <option value="bedtime">Bedtime</option>
                    </select>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Save Reading'}</button>
                </form>
              </motion.div>
            )}

            {/* Recent Records */}
            <div className="card">
              <h3 className="font-semibold mb-3">Recent Readings</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {records.slice(0, 15).map(r => (
                  <div key={r._id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium capitalize">{r.metricType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{new Date(r.recordedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${r.sugarStatus === 'normal' ? 'text-green-600' : r.sugarStatus === 'high' ? 'text-yellow-600' : r.sugarStatus === 'very_high' ? 'text-red-600' : r.sugarStatus === 'low' ? 'text-blue-600' : ''}`}>
                      {r.value} {r.unit}
                    </span>
                  </div>
                ))}
                {records.length === 0 && <p className="text-gray-500 text-sm">No records yet</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Blood Sugar Readings Data for Selected Interval */}
        <div className="card mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold">Blood Sugar Readings Data</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Detailed view of blood glucose logs from <span className="font-semibold text-blue-600">{getDateRangeText(intervalDays)}</span>
              </p>
            </div>
            
            {/* Status Filter Badges */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'low', 'normal', 'high', 'very_high'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                    selectedStatusFilter === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-center">Reading Type</th>
                  <th className="py-3 px-4 text-center">Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Guidance Procedure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {records
                  .filter(r => {
                    const isSugar = ['fasting', 'postprandial', 'random'].includes(r.metricType);
                    if (!isSugar) return false;
                    
                    const withinInterval = new Date(r.recordedAt) >= new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000);
                    if (!withinInterval) return false;

                    if (selectedStatusFilter === 'all') return true;
                    return r.sugarStatus === selectedStatusFilter;
                  })
                  .map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 text-gray-700">
                        <span className="font-medium">{new Date(r.recordedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {new Date(r.recordedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg capitalize">
                          {r.metricType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-800">
                        {r.value} <span className="text-xs text-gray-400 font-normal">{r.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          r.sugarStatus === 'normal'
                            ? 'bg-green-100 text-green-700'
                            : r.sugarStatus === 'high'
                            ? 'bg-yellow-100 text-yellow-700'
                            : r.sugarStatus === 'very_high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            r.sugarStatus === 'normal'
                              ? 'bg-green-500'
                              : r.sugarStatus === 'high'
                              ? 'bg-yellow-500'
                              : r.sugarStatus === 'very_high'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`} />
                          {r.sugarStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const proc = determineProcedure(user?.patientInfo?.diabetesType, r.value);
                            setNextProcedure(proc);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          View Steps
                        </button>
                      </td>
                    </tr>
                  ))}
                {records.filter(r => {
                  const isSugar = ['fasting', 'postprandial', 'random'].includes(r.metricType);
                  if (!isSugar) return false;
                  
                  const withinInterval = new Date(r.recordedAt) >= new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000);
                  if (!withinInterval) return false;

                  if (selectedStatusFilter === 'all') return true;
                  return r.sugarStatus === selectedStatusFilter;
                }).length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No blood sugar readings found for this interval & filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Diabetes Type Onboarding Modal */}
      {showDiabetesSetup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card max-w-md w-full p-6 shadow-xl text-center bg-white border border-gray-100 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">Select Your Diabetes Type</h3>
            <p className="text-gray-600 text-sm mb-6">To customize your sugar status thresholds, alerts, and medical guidance procedures, please specify your diabetes diagnosis.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleSelectDiabetesType('type1')}
                disabled={savingType}
                className="flex flex-col items-center p-4 border border-blue-200 hover:border-blue-500 rounded-xl hover:bg-blue-50/50 transition text-left"
              >
                <span className="font-bold text-blue-700 text-lg mb-1">Type 1</span>
                <span className="text-[11px] text-gray-500 leading-tight">Usually diagnosed in children/young adults. Body doesn't produce insulin.</span>
              </button>

              <button
                onClick={() => handleSelectDiabetesType('type2')}
                disabled={savingType}
                className="flex flex-col items-center p-4 border border-green-200 hover:border-green-500 rounded-xl hover:bg-green-50/50 transition text-left"
              >
                <span className="font-bold text-green-700 text-lg mb-1">Type 2</span>
                <span className="text-[11px] text-gray-500 leading-tight">Most common form. Body has insulin resistance or doesn't use insulin well.</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setShowDiabetesSetup(false)} className="text-sm text-gray-500 hover:underline">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Next Procedure Modal */}
      {nextProcedure && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card max-w-lg w-full p-6 shadow-xl bg-white border border-gray-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${nextProcedure.alertType === 'danger' ? 'bg-red-500' : nextProcedure.alertType === 'warning' ? 'bg-yellow-500' : nextProcedure.alertType === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{nextProcedure.title}</h3>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
              <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-1">📋 Next Procedure Guidance:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-3 leading-relaxed">
                {nextProcedure.steps.map((step, index) => (
                  <li key={index} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setNextProcedure(null)} className="btn-primary px-6 py-2.5">Acknowledge & Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
