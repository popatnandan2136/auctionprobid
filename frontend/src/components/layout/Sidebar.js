import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, User, LogOut, LayoutDashboard, Settings, HelpCircle, LogIn } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout, isAdmin, isMaster } = useAuth();

    const sidebarStyle = {
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-280px',
        width: '280px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        transition: 'left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
        display: isOpen ? 'block' : 'none',
    };

    const headerStyle = {
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e3c72',
        color: 'white',
    };

    const itemStyle = {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#333',
        textDecoration: 'none',
        fontSize: '1rem',
        borderBottom: '1px solid #f0f0f0',
        transition: 'background 0.2s',
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={sidebarStyle}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={require('../../assets/logo.png')} alt="ProBid" style={{ height: '30px', background: 'white', borderRadius: '4px', padding: '2px' }} />
                        <h3 style={{ margin: 0 }}>ProBid</h3>
                    </div>
                    <X size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {user ? (
                        <>
                            <div style={{ padding: '20px', textAlign: 'center', background: '#f8f9fa' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ccc', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={30} color="#fff" />
                                </div>
                                <h4 style={{ margin: '5px 0' }}>{user.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{user.role}</span>
                            </div>

                            <Link to="/profile" style={itemStyle} onClick={onClose}>
                                <User size={20} /> Profile
                            </Link>

                            {(isAdmin() || isMaster()) && (
                                <Link to="/admin" style={itemStyle} onClick={onClose}>
                                    <LayoutDashboard size={20} /> My Auctions (Admin)
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link to="/login" style={itemStyle} onClick={onClose}>
                            <LogIn size={20} /> Login
                        </Link>
                    )}

                    <Link to="/settings" style={itemStyle} onClick={onClose}>
                        <Settings size={20} /> Settings
                    </Link>

                    <Link to="/help" style={itemStyle} onClick={onClose}>
                        <HelpCircle size={20} /> Help & Support
                    </Link>
                </div>

                {user && (
                    <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                        <button
                            onClick={() => { logout(); onClose(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                padding: '10px', border: 'none', background: '#ffebee', color: '#d32f2f',
                                borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;