import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-load each route so the initial bundle stays small — pages are fetched
// on demand and code-split into separate chunks.
const ContractKitLanding = lazy(() => import('./pages/ContractKitLanding'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Contracts = lazy(() => import('./pages/Contracts'));
const ContractView = lazy(() => import('./pages/ContractView'));
const GenerateContract = lazy(() => import('./pages/GenerateContract'));
const Proposals = lazy(() => import('./pages/Proposals'));
const GenerateProposal = lazy(() => import('./pages/GenerateProposal'));
const Training = lazy(() => import('./pages/Training'));
const Templates = lazy(() => import('./pages/Templates'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Security = lazy(() => import('./pages/Security'));
const PublicContract = lazy(() => import('./pages/PublicContract'));
const VerifyContract = lazy(() => import('./pages/VerifyContract'));
const ScopeCreepDefender = lazy(() => import('./pages/ScopeCreepDefender'));

const RouteFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--saas-text-secondary)' }}>
    Loading…
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<ContractKitLanding />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/contract/public/:token" element={<PublicContract />} />
              <Route path="/verify/:token" element={<VerifyContract />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/clients"   element={<ProtectedRoute><Clients /></ProtectedRoute>} />
              <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
              {/* /generate must come BEFORE /:id or the router treats "generate" as an id */}
              <Route path="/contracts/generate" element={<ProtectedRoute><GenerateContract /></ProtectedRoute>} />
              <Route path="/contracts/:id" element={<ProtectedRoute><ContractView /></ProtectedRoute>} />
              <Route path="/proposals"          element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
              <Route path="/proposals/generate" element={<ProtectedRoute><GenerateProposal /></ProtectedRoute>} />
              <Route path="/training"          element={<ProtectedRoute><Training /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/invoices"  element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/defender"  element={<ProtectedRoute><ScopeCreepDefender /></ProtectedRoute>} />
              <Route path="/security"  element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
