import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard.js';
import CreateAuction from './pages/admin/CreateAuction.js';
import AuctionDetails from './pages/admin/AuctionDetails.js';
import AuctionTable from './pages/admin/AuctionTable.js';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-auction" element={<CreateAuction />} />
        <Route path="/admin/auction/:id" element={<AuctionDetails />} />
        <Route path="/admin/auction/:id/table" element={<AuctionTable />} />
      </Routes>
    </Router>
  );
}

export default App;
