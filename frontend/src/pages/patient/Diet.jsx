import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiClock } from 'react-icons/fi';

export default function Diet() {
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/diet/active').catch(() => null),
        api.get('/diet/history'),
      ]);
      if (activeRes?.data?.data) setPlan(activeRes.data.data);
      setHistory(historyRes.data.data);
    } catch {}
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/diet/recommend', {});
      setPlan(res.data.data);
      toast.success('New diet plan generated!');
      loadPlan();
    } catch { toast.error('Failed to generate plan'); }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Diet Plan</h1>
          <button onClick={generatePlan} disabled={loading} className="btn-primary flex items-center gap-2">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> {loading ? 'Generating...' : 'Generate AI Plan'}
          </button>
        </div>

        {plan ? (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{plan.totalCalories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{plan.totalCarbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{plan.totalProtein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{plan.totalFat}g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {plan.meals?.map((meal, i) => (
                <div key={i} className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <FiClock className="text-primary-600" />
                    <h3 className="font-semibold">{meal.name} <span className="text-sm text-gray-500 font-normal">({meal.time})</span></h3>
                  </div>
                  <div className="flex gap-3 text-xs mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{meal.calories} cal</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">GI: {meal.glycemicIndex}</span>
                  </div>
                  {meal.items?.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span>{item.name}</span>
                      <span className="text-gray-500">{item.quantity} ({item.calories} cal)</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {plan.recommendations?.length > 0 && (
              <div className="card mb-6">
                <h3 className="font-semibold mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {plan.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-green-500">&#10003;</span>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No diet plan generated yet. Click the button above to get an AI-personalized meal plan.</p>
            <button onClick={generatePlan} disabled={loading} className="btn-primary">{loading ? 'Generating...' : 'Generate My Plan'}</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
