import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import RootRedirect from './components/RootRedirect';

// Pages
import Home from './pages/Home';
import AIAgent from './pages/AIAgent';
import Login from './pages/Login';
import Register from './pages/Register';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-land" element={<LandRecordTest />} />

          <Route path="/" element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route index element={<RootRedirect />} />
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
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
