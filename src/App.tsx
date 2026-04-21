import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import SalesRevenue from './pages/SalesRevenue';

import PageBuilder from './pages/PageBuilder';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-revenue/*"
            element={
              <ProtectedRoute>
                <SalesRevenue />
              </ProtectedRoute>
            }
          />

          <Route
            path="/page-builder"
            element={
              <ProtectedRoute>
                <PageBuilder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
