import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIConfigProvider } from './contexts/AIConfigContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import SalesRevenue from './pages/SalesRevenue';
import CustomerAcquisition from './pages/CustomerAcquisition';
import Broadband from './pages/Broadband';
import SmartHome from './pages/SmartHome';
import RightsProducts from './pages/RightsProducts';
import HomeNetworking from './pages/HomeNetworking';
import WeekReview from './pages/WeekReview';
import PptEditor from './pages/ppt-editor/PptEditor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AIConfigProvider>
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
            <Route
              path="/week-review/*"
              element={
                <ProtectedRoute>
                  <WeekReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppt-editor/*"
              element={
                <ProtectedRoute>
                  <PptEditor />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AIConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
