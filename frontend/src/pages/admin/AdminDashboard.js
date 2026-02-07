import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
    const { user, isMaster } = useAuth();

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
            {/* Sidebar */}
            <aside style={{ width: "250px", background: "#f8f9fa", borderRight: "1px solid #eee", padding: "20px" }}>
                <h5 style={{ color: "#888", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px", marginBottom: "20px" }}>Admin Menu</h5>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    <li style={{ marginBottom: "10px" }}>
                        <Link to="/admin" style={{ textDecoration: "none", color: "#333", display: "block", padding: "10px", borderRadius: "5px", transition: "background 0.2s" }} className="admin-link">
                            📊 Dashboard
                        </Link>
                    </li>
                    {!isMaster() && (
                        <>
                            <li style={{ marginBottom: "10px" }}>
                                <Link to="/admin/auctions" style={{ textDecoration: "none", color: "#333", display: "block", padding: "10px", borderRadius: "5px" }} className="admin-link">
                                    🔨 Auctions
                                </Link>
                            </li>
                            <li style={{ marginBottom: "10px" }}>
                                <Link to="/admin/players" style={{ textDecoration: "none", color: "#333", display: "block", padding: "10px", borderRadius: "5px" }} className="admin-link">
                                    👤 Player Management
                                </Link>
                            </li>
                        </>
                    )}
                    {isMaster() && (
                        <li style={{ marginBottom: "10px" }}>
                            <Link to="/admin/admins" style={{ textDecoration: "none", color: "#333", display: "block", padding: "10px", borderRadius: "5px" }} className="admin-link">
                                🔑 Admin Management
                            </Link>
                        </li>
                    )}
                </ul>
            </aside>

            {/* content */}
            <main style={{ flex: 1, padding: "30px" }}>
                <Outlet />
            </main>
        </div>
    );
}
