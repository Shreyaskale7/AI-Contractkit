import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ContractKitLanding from './pages/ContractKitLanding';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Clients          from './pages/Clients';
import Contracts        from './pages/Contracts';
import ContractView     from './pages/ContractView';
import GenerateContract from './pages/GenerateContract';
import Proposals        from './pages/Proposals';
import GenerateProposal from './pages/GenerateProposal';
import Training         from './pages/Training';
import Templates       from './pages/Templates';
import Invoices         from './pages/Invoices';
import Analytics        from './pages/Analytics';
import Profile from './pages/Profile';
import Security from './pages/Security';
import PublicContract from './pages/PublicContract';
import ScopeCreepDefender from './pages/ScopeCreepDefender';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<ContractKitLanding />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
            <Route path="/contract/public/:token" element={<PublicContract />} />
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
