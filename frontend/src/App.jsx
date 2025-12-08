import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import RootRedirect from './components/RootRedirect';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import AIAgent from './pages/AIAgent';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import SelectField from './pages/SelectField';
import Market from './pages/Market';
import Weather from './pages/Weather';
import Profile from './pages/Profile';
import CropRecommendation from './pages/CropRecommendation';
import SoilReport from './pages/SoilReport';
import Community from './pages/Community';
import Schemes from './pages/Schemes';
import Training from './pages/Training';
import Help from './pages/Help';
import LandRecordTest from './pages/LandRecordTest';

// New Admin Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsers from './pages/dashboard/AdminUsers';
import FarmerDetail from './pages/dashboard/FarmerDetail';
import GodownManagerDashboard from './pages/dashboard/GodownManagerDashboard';
import StockLogs from './pages/dashboard/StockLogs';
import PestDoctor from './pages/dashboard/PestDoctor';
import GovBodyDashboard from './pages/dashboard/GovBodyDashboard';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/test-land" element={<LandRecordTest />} />

            <Route path="/" element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route index element={<RootRedirect />} />

                {/* Farmer Routes */}
                <Route path="select-field" element={<SelectField />} />
                <Route path="dashboard/:landId" element={<Home />} />
                <Route path="agent" element={<AIAgent />} />
                <Route path="market" element={<Market />} />
                <Route path="weather" element={<Weather />} />
                <Route path="profile" element={<Profile />} />
                <Route path="crop-recommendation" element={<CropRecommendation />} />
                <Route path="soil-report" element={<SoilReport />} />
                <Route path="community" element={<Community />} />
                <Route path="schemes" element={<Schemes />} />
                <Route path="training" element={<Training />} />
                <Route path="help" element={<Help />} />
                <Route path="pest-doctor" element={<PestDoctor />} />

                {/* Admin / Web Routes */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/farmer/:id" element={<FarmerDetail />} />
                <Route path="godown/dashboard" element={<GodownManagerDashboard />} />
                <Route path="godown/stock-logs" element={<StockLogs />} />
                <Route path="gov/dashboard" element={<GovBodyDashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
