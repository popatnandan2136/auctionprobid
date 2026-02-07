import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
    const { user, logout, isAdmin, isMaster } = useAuth();
    const location = useLocation();

    const navStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)",
        color: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    };

    const linkStyle = {
        color: "rgba(255,255,255,0.9)",
        textDecoration: "none",
        marginLeft: "20px",
        fontWeight: "500",
        fontSize: "0.95rem",
        transition: "all 0.3s ease"
    };

    const activeLinkStyle = {
        ...linkStyle,
        color: "#ffd700",
        fontWeight: "bold"
    };

    const isActive = (path) => location.pathname === path;

    // We need to import Menu icon, but I'll use a simple SVG to avoid more imports if not passed
    // Actually, let's use Lucide if we can, or just text for now? 
    // Wait, I can pass the icon as a child or import it. 
    // Let's modify the component to accept onMenuClick and use a hamburger icon.

    return (
        <nav style={navStyle}>
            <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="menu-btn" onClick={onMenuClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                    <Menu size={24} />
                </button>
                {/* Logo Added */}
                <img src="/probid_logo.png" alt="ProBid" style={{ height: '35px' }} />
                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>ProBidAuction</h1>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
                {!isAdmin() && !isMaster() && <Link to="/" style={isActive("/") ? activeLinkStyle : linkStyle}>Home</Link>}
                {/* Public Auction View Links will be dynamic */}

                {user ? (
                    <>
                        {isAdmin() && <Link to="/admin" style={isActive("/admin") ? activeLinkStyle : linkStyle}>Dashboard</Link>}
                        <div style={{ marginLeft: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "0.9em", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "15px" }}>
                                {user.name} ({user.role})
                            </span>
                            <button onClick={logout} style={{
                                background: "#ff4d4d", border: "none", color: "white", padding: "5px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
                            }}>Logout</button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" style={isActive("/login") ? activeLinkStyle : linkStyle}>Login</Link>
                )}
            </div>
        </nav>
    );
}
