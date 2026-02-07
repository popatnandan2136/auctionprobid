import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProBidIntro from "./pages/public/ProBidIntro";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import LiveAuctions from "./components/dashboard/LiveAuctions";
import UpcomingAuctions from "./components/dashboard/UpcomingAuctions";
import FinishedAuctions from "./components/dashboard/FinishedAuctions";

import AuctionDashboard from "./components/auction/AuctionDashboard";

// Public Pages
// import Home from "./pages/public/Home"; // Replaced by Dashboard
import Login from "./pages/public/Login";
import AuctionPublicView from "./pages/public/AuctionPublicView";
import Register from "./pages/public/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AuctionManagement from "./pages/admin/AuctionManagement";
import AuctionDetails from "./pages/admin/AuctionDetails";
import AuctioneerConsole from "./pages/admin/AuctioneerConsole";
import AuctionTable from "./pages/admin/AuctionTable";
import PlayerManagement from "./pages/admin/PlayerManagement";
import CreateAdmin from "./pages/admin/CreateAdmin";
import AdminManagement from "./pages/admin/AdminManagement"; // 🔥 Import
import TeamDashboard from "./pages/team/TeamDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: "100vh", background: "#f4f6f8", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
          <Routes>
            {/* Landing Page (Standalone) */}
            <Route path="/" element={<ProBidIntro />} />

            {/* Public/Dashboard Layout Routes */}
            <Route element={<MainLayout />}>

              <Route path="/dashboard">
                <Route index element={<Navigate to="live" replace />} />
                <Route path="live" element={<LiveAuctions />} />
                <Route path="upcoming" element={<UpcomingAuctions />} />
                <Route path="finished" element={<FinishedAuctions />} />
              </Route>

              <Route path="/auction/live/:id" element={<TeamDashboard />} /> {/* Team/Public Live View */}

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auction-view/:id" element={<AuctionPublicView />} />
            </Route>

            {/* Admin Routes (Protected - could also use MainLayout if Sidebar handles admin links) */}
            {/* For now, keeping Admin separate or nested? 
                Spec says "Navigation Drawer... My Auctions (Admin)". 
                So Admin likely lives INSIDE MainLayout too? 
                But Admin usually has a different view.
                The prompt says "Navigation Drawer... My Auctions (Admin)".
                This suggests the MainLayout should support Admin views too.
                Let's use MainLayout for Admin too for now.
            */}

            <Route element={<ProtectedRoute roles={["ADMIN", "MASTER_ADMIN"]} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin" element={<AdminDashboard />}>
                  <Route index element={<AdminHome />} />
                  <Route path="auctions" element={<AuctionManagement />} />
                  <Route path="auction/:id" element={<AuctionDetails />} /> {/* Admin Config View */}
                  <Route path="auction/:id/table" element={<AuctionTable />} /> {/* Table View */}
                  <Route path="players" element={<PlayerManagement />} />
                  <Route path="create-admin" element={<CreateAdmin />} />
                  <Route path="admins" element={<AdminManagement />} /> {/* 🔥 New Route */}
                </Route>
              </Route>
              {/* Fullscreen Console Route (Outside MainLayout) */}
              <Route path="/admin/auction/:id/console" element={<AuctioneerConsole />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;