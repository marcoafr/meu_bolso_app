import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import { useAuth } from './authenticationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RegisterTransaction from './components/RegisterTransaction';
import Categories from './components/Categories';
import Budgets from './components/Budgets';
import Transactions from './components/Transactions';
import BanksAndCards from './components/BanksAndCards';
import { SnackbarProvider } from './directives/snackbar/SnackbarContext';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <SnackbarProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<><Navbar/> <Home /></>} />
            <Route path="/dashboard" element={<><Navbar/> <Dashboard /></>} />
            <Route path="/registerTransaction" element={<><Navbar/> <RegisterTransaction /></>} />
            <Route path="/transactions" element={<><Navbar/> <Transactions /></>} />
            <Route path="/categories" element={<><Navbar/> <Categories /></>} />
            <Route path="/budgets" element={<><Navbar/> <Budgets /></>} />
            <Route path="/banksAndCards" element={<><Navbar/> <BanksAndCards /></>} />
            {/* Adicione outras rotas protegidas aqui */}
          </Route>
          <Route path="/" element={!isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/home" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
