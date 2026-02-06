import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CreateAuction from './pages/admin/CreateAuction.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-auction" element={<CreateAuction />} />
      </Routes>
    </Router>
  );
}

export default App;
