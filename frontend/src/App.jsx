import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Clients          from './pages/Clients';
import Contracts        from './pages/Contracts';
import GenerateContract from './pages/GenerateContract';
import Proposals        from './pages/Proposals';
import GenerateProposal from './pages/GenerateProposal';
import Templates       from './pages/Templates';
import Invoices         from './pages/Invoices';
import Analytics        from './pages/Analytics';
import Profile from './pages/Profile';
import PublicContract from './pages/PublicContract';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients"   element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
          <Route path="/contracts/generate" element={<ProtectedRoute><GenerateContract /></ProtectedRoute>} />
          <Route path="/proposals"          element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
          <Route path="/proposals/generate" element={<ProtectedRoute><GenerateProposal /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/invoices"  element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/contract/public/:token" element={<PublicContract />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
