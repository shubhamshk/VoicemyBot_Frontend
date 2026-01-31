
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ExtensionAuth from './pages/ExtensionAuth';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-black" />;

  if (!user) {
    return <Navigate to="/extension-auth" replace />;
  }

  return children;
};

// Layout Wrapper (Navbar + Page + Footer)
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-deep-black text-white selection:bg-neon-blue/30 selection:text-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

const LayoutNoFooter = ({ children }) => {
  return (
    <div className="min-h-screen bg-deep-black text-white selection:bg-neon-blue/30 selection:text-white">
      <Navbar />
      {children}
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <LayoutNoFooter>
            <Dashboard />
          </LayoutNoFooter>
        </ProtectedRoute>
      } />

      <Route path="/extension-auth" element={<ExtensionAuth />} />
      <Route path="/login" element={<ExtensionAuth />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
