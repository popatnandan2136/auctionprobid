import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Calendar, CheckSquare } from 'lucide-react';

const BottomNav = () => {
    const navStyle = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60px',
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
    };

    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#1e3c72' : '#888',
        fontSize: '0.8rem',
        fontWeight: isActive ? 'bold' : 'normal',
    });

    return (
        <div style={navStyle}>
            <NavLink to="/dashboard/live" style={linkStyle}>
                <Radio size={24} />
                <span style={{ marginTop: '4px' }}>Live</span>
            </NavLink>
            <NavLink to="/dashboard/upcoming" style={linkStyle}>
                <Calendar size={24} />
                <span style={{ marginTop: '4px' }}>Upcoming</span>
            </NavLink>
            <NavLink to="/dashboard/finished" style={linkStyle}>
                <CheckSquare size={24} />
                <span style={{ marginTop: '4px' }}>Finished</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;
