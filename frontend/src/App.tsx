import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import { useAuth } from './authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<><Navbar/> <Home /></>} />
          {/* Adicione outras rotas protegidas aqui */}
        </Route>
        {/*<Route path="/" element={!isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/home" />} />*/}
      </Routes>
    </Router>
  );
};

export default App;
