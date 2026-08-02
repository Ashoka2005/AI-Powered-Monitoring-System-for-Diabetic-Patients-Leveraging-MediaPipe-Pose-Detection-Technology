import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiTrendingUp, FiShield, FiUsers, FiSmartphone } from 'react-icons/fi';

export default function Landing() {
  const features = [
    { icon: <FiActivity className="w-8 h-8" />, title: 'AI Pose Detection', desc: 'Real-time exercise tracking with MediaPipe and voice coaching' },
    { icon: <FiHeart className="w-8 h-8" />, title: 'Blood Sugar Monitoring', desc: 'Track trends and get AI predictions for better control' },
    { icon: <FiTrendingUp className="w-8 h-8" />, title: 'Risk Prediction', desc: 'ML-powered diabetic risk assessment and prevention' },
    { icon: <FiShield className="w-8 h-8" />, title: 'Fall Detection', desc: 'Automatic emergency alerts with pose-based detection' },
    { icon: <FiUsers className="w-8 h-8" />, title: 'Doctor Dashboard', desc: 'Remote patient monitoring and telemedicine appointments' },
    { icon: <FiSmartphone className="w-8 h-8" />, title: 'IoT Integration', desc: 'Connect glucose monitors and smartwatches seamlessly' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">D</div>
          <span className="text-xl font-bold text-gray-900">DiaFit AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-20 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">AI-Powered Healthcare Platform</span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Manage Diabetes <br />
            <span className="text-primary-600">Smarter with AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Real-time pose detection, AI risk prediction, personalized diet plans, and doctor monitoring - all in one platform built for diabetic patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Free Today</Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">Learn More</a>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-20 py-12 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['33', 'Body Landmarks'], ['10+', 'Exercise Types'], ['24/7', 'AI Monitoring'], ['100%', 'Free to Use']].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-primary-600">{num}</div>
              <div className="text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 lg:px-20 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need for Diabetes Care</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Comprehensive tools powered by artificial intelligence and computer vision</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-20 py-20 bg-primary-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join DiaFit AI and experience the future of diabetes management with AI-powered tools.</p>
        <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">Create Free Account</Link>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2024 DiaFit AI. AI-Powered Healthcare Platform. For educational purposes. Always consult your doctor.</p>
      </footer>
    </div>
  );
}
