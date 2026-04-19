import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import SalesRevenue from './pages/SalesRevenue';
import CustomerAcquisition from './pages/CustomerAcquisition';
import Broadband from './pages/Broadband';
import SmartHome from './pages/SmartHome';
import RightsProducts from './pages/RightsProducts';
import HomeNetworking from './pages/HomeNetworking';

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
            path="/customer-acquisition/*"
            element={
              <ProtectedRoute>
                <CustomerAcquisition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/broadband/*"
            element={
              <ProtectedRoute>
                <Broadband />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-home/*"
            element={
              <ProtectedRoute>
                <SmartHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rights-products/*"
            element={
              <ProtectedRoute>
                <RightsProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home-networking/*"
            element={
              <ProtectedRoute>
                <HomeNetworking />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
