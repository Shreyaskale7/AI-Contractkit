import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:48, height:48, border:'4px solid #6366f1', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
    </div>
  );

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;