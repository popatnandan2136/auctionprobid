import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard.js';
import CreateAuction from './pages/admin/CreateAuction.js';
import AuctionDetails from './pages/admin/AuctionDetails.js';
import AuctionTable from './pages/admin/AuctionTable.js';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import MainLoader from './components/MainLoader';

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) return <MainLoader />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="dashboard" element={<div>Dashboard Content Placeholder</div>} /> {/* Nested route example */}
      </Route>
      {/* Flat routes for now as per original structure */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/create-auction" element={<CreateAuction />} />
      <Route path="/admin/auction/:id" element={<AuctionDetails />} />
      <Route path="/admin/auction/:id/table" element={<AuctionTable />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
