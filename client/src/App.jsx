import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { isAdmin } from './utils/adminAuth';
import Login from './app/pages/Login';
import Generator from './app/pages/Generator';
import './App.css';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isUserAdmin, setIsUserAdmin] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const admin = await isAdmin();
        setIsUserAdmin(admin);
      } else {
        setIsUserAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 60%, #eef2ff 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          fontSize: 'clamp(16px, 4vw, 18px)', 
          color: '#6366F1',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route 
          path="/login" 
          element={user && isUserAdmin ? <Navigate to="/generator" /> : <Login />} 
        />
        <Route 
          path="/generator" 
          element={user && isUserAdmin ? <Generator /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

