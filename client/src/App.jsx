import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ManagerAuth from './pages/ManagerAuth';
import StudentAuth from './pages/StudentAuth';
import ManagerDashboard, { ManagerDashboardErrorBoundary } from './pages/ManagerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Footer from './components/Footer';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-dark text-white font-body flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-gray-800 backdrop-blur-md sticky top-0 z-50 bg-dark/80">
        <div className="flex items-center gap-2">
          <img src="/optimeal-logo.png?v=2" alt="OptiMeal Logo" className="w-10 h-10 rounded-xl object-contain" />
          <h1 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
            OptiMeal
          </h1>
        </div>
      </header>

      <main className="w-full px-6 md:px-12 py-12">
        <div className="text-center py-20 space-y-6">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            Zero Waste. <br />
            <span className="text-primary">Maximum Taste.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Smart mess management that saves food, money, and the planet.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 pt-12">

            {/* Manager Card */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500 transition-all group w-full md:w-80 cursor-pointer" onClick={() => navigate('/auth/manager')}>
              <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold group-hover:scale-110 transition-transform">
                M
              </div>
              <h3 className="text-2xl font-bold mb-2">For Managers</h3>
              <p className="text-gray-400 mb-6">Create a mess, track waste, & optimize daily menus.</p>
              <div className="flex items-center text-purple-500 font-bold">
                Login / Register <span className="ml-2">→</span>
              </div>
            </div>

            {/* Student Card */}
            <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-primary transition-all group w-full md:w-80 cursor-pointer" onClick={() => navigate('/auth/student')}>
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold group-hover:scale-110 transition-transform">
                S
              </div>
              <h3 className="text-2xl font-bold mb-2">For Students</h3>
              <p className="text-gray-400 mb-6">Join a mess, toggle meals, & track your impact.</p>
              <div className="flex items-center text-primary font-bold">
                Login / Join <span className="ml-2">→</span>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-white text-center"><h1>Something went wrong.</h1><button onClick={() => window.location.reload()} className="mt-4 bg-primary px-4 py-2 rounded text-dark font-bold">Reload</button></div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/manager" element={<ManagerAuth />} />
          <Route path="/auth/student" element={<StudentAuth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/manager/dashboard" element={<ManagerDashboardErrorBoundary />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </GlobalErrorBoundary>
  )
}

export default App
