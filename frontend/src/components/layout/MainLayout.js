import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, isAdmin, isMaster } = useAuth();

    // Toggle Sidebar
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* Top Navigation */}
            <Navbar onMenuClick={toggleSidebar} />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar (Drawer) */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content Area */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '80px' }}>
                    {/* 80px padding for Bottom Nav */}
                    <Outlet />
                </main>
            </div>

            {/* Bottom Navigation */}
            {(!user || (!isAdmin() && !isMaster())) && <BottomNav />}
        </div>
    );
};

export default MainLayout;
