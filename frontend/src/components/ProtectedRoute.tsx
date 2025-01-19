// src/utils/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../authenticationContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();  // Hook para obter o estado de autenticação

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a tela de login
    return <Navigate to="/login" replace />;
  }

  // Caso esteja autenticado, renderiza o conteúdo da rota protegida
  return <Outlet />
};

export default ProtectedRoute;
